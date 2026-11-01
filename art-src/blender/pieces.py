# Renders Spa City Sparkle's board sprites: the six pieces, their specials, the Spring Crystal, the bath
# token and every blocker state. Builds each model from scratch (procedural bmesh / curves), lights it as a
# glossy toy under a warm key and a cool rim, and renders 256 px RGBA PNGs with a soft contact shadow.
#   "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b -P art-src/blender/pieces.py -- <outdir> [--only name,name] [--size 256] [--samples 96]
# Outputs <outdir>/<name>.png with names matching the game's texture keys (p0, p0h, p0v, p0b, p0B, crystal, …).
import bpy, bmesh, sys, os, math
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
out = argv[0] if argv and not argv[0].startswith('--') else os.path.join(os.path.dirname(__file__), 'renders')
def opt(name, default):
    return argv[argv.index(name) + 1] if name in argv else default
ONLY = set(opt('--only', '').split(',')) - {''}
SIZE = int(opt('--size', 256))
SAMPLES = int(opt('--samples', 96))
os.makedirs(out, exist_ok=True)

# ---------------------------------------------------------------- scene
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = True
sc.cycles.device = 'CPU'
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    for backend in ('OPTIX', 'CUDA', 'HIP', 'ONEAPI'):
        try:
            prefs.compute_device_type = backend
            prefs.get_devices()
            if any(d.type == backend for d in prefs.devices):
                for d in prefs.devices: d.use = d.type == backend
                sc.cycles.device = 'GPU'
                break
        except Exception:
            pass
except Exception:
    pass
sc.render.resolution_x = sc.render.resolution_y = SIZE
sc.render.film_transparent = True
sc.view_settings.view_transform = 'Standard'
sc.view_settings.look = 'None'
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGBA'
sc.cycles.film_transparent_glass = False

world = bpy.data.worlds.new('studio'); sc.world = world; world.use_nodes = True
wn = world.node_tree.nodes; wl = world.node_tree.links
bg = wn['Background']
# a soft studio gradient (bright top, warm bottom) gives clean highlights on glossy shapes
grad = wn.new('ShaderNodeTexGradient'); grad.gradient_type = 'LINEAR'
coord = wn.new('ShaderNodeTexCoord'); mapn = wn.new('ShaderNodeMapping')
mapn.inputs['Rotation'].default_value = (0, math.radians(-90), 0)
ramp = wn.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color = (0.55, 0.45, 0.35, 1)
ramp.color_ramp.elements[1].color = (1.0, 1.0, 1.0, 1)
wl.new(coord.outputs['Generated'], mapn.inputs['Vector']); wl.new(mapn.outputs['Vector'], grad.inputs['Vector'])
wl.new(grad.outputs['Fac'], ramp.inputs['Fac']); wl.new(ramp.outputs['Color'], bg.inputs['Color'])
bg.inputs['Strength'].default_value = 0.45

cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.type = 'ORTHO'; cam.data.ortho_scale = 1.04
TILT = math.radians(14)
cam.location = (0, -math.sin(TILT) * 6, math.cos(TILT) * 6)
cam.rotation_euler = (TILT, 0, 0)

def light(name, kind, energy, size, loc, rot, color):
    l = bpy.data.lights.new(name, kind); l.energy = energy; l.color = color
    if kind == 'AREA': l.size = size
    o = bpy.data.objects.new(name, l); o.location = loc; o.rotation_euler = [math.radians(a) for a in rot]
    sc.collection.objects.link(o); return o
light('key', 'AREA', 380, 1.4, (-2.2, -1.8, 3.0), (38, -34, 0), (1.0, 0.93, 0.84))
light('rim', 'AREA', 220, 2.2, (2.4, 2.6, 1.6), (-58, 40, 0), (0.75, 0.86, 1.0))
light('fill', 'AREA', 50, 3.0, (0.5, -3.2, 1.2), (70, 8, 0), (1.0, 0.98, 0.95))

bpy.ops.mesh.primitive_plane_add(size=8, location=(0, 0, 0))
ground = bpy.context.active_object; ground.name = 'ground'; ground.is_shadow_catcher = True

# ---------------------------------------------------------------- helpers
def mat(name, color, metallic=0.0, rough=0.3, coat=0.0, sss=0.0, trans=0.0, ior=1.45, emit=None, emit_str=0.0, film=0.0, alpha=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = metallic
    p.inputs['Roughness'].default_value = rough
    p.inputs['Coat Weight'].default_value = coat
    p.inputs['Coat Roughness'].default_value = 0.05
    p.inputs['Subsurface Weight'].default_value = sss
    p.inputs['Subsurface Radius'].default_value = (0.4, 0.25, 0.2)
    p.inputs['Subsurface Scale'].default_value = 0.08
    p.inputs['Transmission Weight'].default_value = trans
    p.inputs['IOR'].default_value = ior
    p.inputs['Alpha'].default_value = alpha
    if emit:
        p.inputs['Emission Color'].default_value = (*emit, 1)
        p.inputs['Emission Strength'].default_value = emit_str
    if film:
        p.inputs['Thin Film Thickness'].default_value = film
    return m

def srgb(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)

def link(obj):
    sc.collection.objects.link(obj); return obj

def mesh_obj(name, bm, m=None, smooth=True):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    if smooth:
        for poly in me.polygons: poly.use_smooth = True
    o = bpy.data.objects.new(name, me); link(o)
    if m: o.data.materials.append(m)
    return o

def add_mod(o, kind, **kw):
    md = o.modifiers.new(kind.lower(), kind)
    for k, v in kw.items(): setattr(md, k, v)
    return md

def curve_from_points(name, pts, depth, bevel, m, closed=True, res=6):
    """A closed 2D outline (x, y in -0.5..0.5) extruded and bevelled into a chunky rounded toy shape."""
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '2D'; cu.fill_mode = 'BOTH'
    cu.extrude = depth; cu.bevel_depth = bevel; cu.bevel_resolution = res; cu.resolution_u = 12
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for i, (x, y) in enumerate(pts): sp.points[i].co = (x, y, 0, 1)
    sp.use_cyclic_u = closed
    o = bpy.data.objects.new(name, cu); link(o); o.data.materials.append(m)
    return o

def smooth_outline(pts, n=6):
    """Chaikin corner cutting: rounds a polygon into a soft outline."""
    for _ in range(n // 2):
        res = []
        for i in range(len(pts)):
            a, b = Vector(pts[i]), Vector(pts[(i + 1) % len(pts)])
            res += [tuple(a * 0.75 + b * 0.25), tuple(a * 0.25 + b * 0.75)]
        pts = res
    return pts

def clear_models():
    for o in list(sc.collection.objects):
        if o.type in ('MESH', 'CURVE') and o.name != 'ground':
            bpy.data.objects.remove(o, do_unlink=True)

def render(name):
    if ONLY and name not in ONLY and not any(name.startswith(x + ':') for x in ONLY):
        return
    sc.render.filepath = os.path.join(out, name + '.png')
    bpy.ops.render.render(write_still=True)
    print('rendered', name)

def wanted(names):
    return not ONLY or any(n in ONLY for n in names)

Z = 0.0  # pieces rest on the ground plane

# ---------------------------------------------------------------- piece models (each fits ~0.8 × 0.8)
PIECE_MATS = {
    0: mat('quartz', srgb('#7A3BE0'), rough=0.05, coat=1.0, trans=0.15, ior=1.55, sss=0.1, film=260),
    1: mat('magnolia', srgb('#F0559A'), rough=0.3, sss=0.35, coat=0.8),
    2: mat('brass', srgb('#E6A12A'), metallic=1.0, rough=0.2),
    3: mat('drop', srgb('#0FA6DC'), rough=0.04, coat=1.0, trans=0.2, ior=1.33, sss=0.15),
    4: mat('coral', srgb('#FF5A36'), rough=0.18, coat=1.0, sss=0.2),
    5: mat('pine', srgb('#0F7A32'), rough=0.2, coat=1.0, sss=0.08),
}
GOLD = mat('gold', srgb('#F2C25A'), metallic=1.0, rough=0.2)
CENTRE = mat('stamen', srgb('#F6C933'), rough=0.4, sss=0.3)
COPPER = mat('copper', srgb('#B87333'), metallic=1.0, rough=0.3)
DARKIRON = mat('iron', srgb('#2F3036'), metallic=0.9, rough=0.35)
STEEL = mat('steel', srgb('#9AA3B2'), metallic=1.0, rough=0.25)

def build_quartz():
    # a faceted hexagonal crystal lying toward the camera: six long facets and pyramid tips
    bm = bmesh.new()
    r, L, tip = 0.22, 0.42, 0.2
    rings = []
    for yv in (-L / 2, L / 2):
        ring = [bm.verts.new((math.cos(a) * r, yv, math.sin(a) * r * 0.9 + 0.22)) for a in [i * math.pi / 3 + math.pi / 6 for i in range(6)]]
        rings.append(ring)
    t0 = bm.verts.new((0, -L / 2 - tip, 0.22)); t1 = bm.verts.new((0, L / 2 + tip, 0.22))
    for i in range(6):
        j = (i + 1) % 6
        bm.faces.new((rings[0][i], rings[0][j], rings[1][j], rings[1][i]))
        bm.faces.new((rings[0][j], rings[0][i], t0))
        bm.faces.new((rings[1][i], rings[1][j], t1))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = mesh_obj('quartz', bm, PIECE_MATS[0], smooth=False)
    add_mod(o, 'BEVEL', width=0.012, segments=2)
    o.rotation_euler = (0, 0, math.radians(-28)); o.scale = (1.15, 1.15, 1.15)
    return [o]

def build_magnolia():
    objs = []
    for i in range(6):
        a = i * math.pi / 3 + math.pi / 6
        bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=0.2)
        p = bpy.context.active_object; p.name = f'petal{i}'
        p.scale = (0.62, 1.0, 0.28)
        p.location = (math.cos(a) * 0.2, math.sin(a) * 0.2, 0.12)
        p.rotation_euler = (math.radians(-18) * 0, math.radians(14), a - math.pi / 2)
        # cup the petal upward at its tip
        add_mod(p, 'SIMPLE_DEFORM', deform_method='BEND', angle=math.radians(-35), deform_axis='X')
        p.data.materials.append(PIECE_MATS[1]); bpy.ops.object.shade_smooth()
        objs.append(p)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.1, location=(0, 0, 0.2))
    c = bpy.context.active_object; c.scale = (1, 1, 0.7); c.data.materials.append(CENTRE); bpy.ops.object.shade_smooth()
    add_mod(c, 'DISPLACE', strength=0.02, texture=noise_tex('stamen', 0.03))
    objs.append(c)
    return objs

def noise_tex(name, size):
    t = bpy.data.textures.get(name) or bpy.data.textures.new(name, 'CLOUDS')
    t.noise_scale = size
    return t

def build_horseshoe():
    cu = bpy.data.curves.new('shoe', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.095; cu.bevel_resolution = 6; cu.resolution_u = 24
    sp = cu.splines.new('BEZIER')
    pts = [(-0.24, -0.3), (-0.27, 0.02), (0, 0.29), (0.27, 0.02), (0.24, -0.3)]
    sp.bezier_points.add(len(pts) - 1)
    for i, (x, y) in enumerate(pts):
        bp = sp.bezier_points[i]; bp.co = (x, y, 0.1); bp.handle_left_type = bp.handle_right_type = 'AUTO'
    o = bpy.data.objects.new('shoe', cu); link(o); o.data.materials.append(PIECE_MATS[2])
    o.scale = (1.15, 1.15, 0.75)
    objs = [o]
    for x, y in [(-0.27, -0.18), (-0.29, 0.0), (-0.2, 0.17), (0.27, -0.18), (0.29, 0.0), (0.2, 0.17)]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.022, depth=0.02, location=(x * 1.15, y * 1.15, 0.165))
        n = bpy.context.active_object; n.data.materials.append(DARKIRON); objs.append(n)
    return objs

def build_drop():
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=0.27, location=(0, -0.06, 0.2))
    o = bpy.context.active_object; o.name = 'drop'
    me = o.data
    for v in me.vertices:
        # pull the +Y side into a point: a teardrop pointing "up" on screen
        if v.co.y > 0:
            k = min(1.0, v.co.y / 0.27)
            v.co.x *= (1 - k) ** 1.4 + 0.02
            v.co.z *= (1 - k) ** 1.4 + 0.02
            v.co.y *= 1.0 + 0.85 * k
    o.scale = (1, 1, 0.7)
    o.data.materials.append(PIECE_MATS[3]); bpy.ops.object.shade_smooth()
    # a bright inner glint
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.05, location=(-0.08, -0.12, 0.33))
    g = bpy.context.active_object; g.scale = (0.7, 1.3, 0.4)
    g.data.materials.append(mat('glint', (1, 1, 1), rough=0.1, emit=(1, 1, 1), emit_str=3.0)); bpy.ops.object.shade_smooth()
    return [o, g]

def build_scallop():
    bm = bmesh.new()
    ribs, rings = 64, 14
    centre = bm.verts.new((0, -0.24, 0.05))
    grid = []
    for ri in range(1, rings + 1):
        row = []
        rr = ri / rings
        for k in range(ribs + 1):
            a = math.pi * (0.06 + 0.88 * k / ribs)
            rad = 0.48 * rr
            x = math.cos(a) * rad; y = -0.24 + math.sin(a) * rad * 1.05
            z = 0.05 + 0.17 * math.sin(rr * math.pi * 0.85) + 0.035 * rr * (0.5 - 0.5 * math.cos(k / ribs * math.tau * 9))
            row.append(bm.verts.new((x, y, z)))
        grid.append(row)
    for k in range(ribs):
        bm.faces.new((centre, grid[0][k], grid[0][k + 1]))
    for ri in range(rings - 1):
        for k in range(ribs):
            bm.faces.new((grid[ri][k], grid[ri + 1][k], grid[ri + 1][k + 1], grid[ri][k + 1]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = mesh_obj('scallop', bm, PIECE_MATS[4])
    add_mod(o, 'SOLIDIFY', thickness=0.04)
    add_mod(o, 'SUBSURF', levels=1, render_levels=2)
    o.location.y = 0.04
    # hinge "ears"
    bpy.ops.mesh.primitive_cube_add(size=0.14, location=(0, -0.24, 0.06))
    h = bpy.context.active_object; h.scale = (1.4, 0.6, 0.45); h.data.materials.append(PIECE_MATS[4])
    add_mod(h, 'BEVEL', width=0.02, segments=3)
    return [o, h]

def build_pine():
    objs = []
    for i, (y, r) in enumerate([(0.2, 0.15), (0.03, 0.22), (-0.15, 0.29)]):
        bpy.ops.mesh.primitive_cone_add(vertices=7, radius1=r, radius2=0.0, depth=0.3, location=(0, y, 0.12))
        c = bpy.context.active_object; c.rotation_euler = (math.radians(-90), 0, 0)
        c.scale = (1.15, 1, 1.0)
        c.data.materials.append(PIECE_MATS[5])
        add_mod(c, 'BEVEL', width=0.03, segments=3)
        objs.append(c)
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.045, depth=0.16, location=(0, -0.38, 0.1))
    s = bpy.context.active_object; s.rotation_euler = (math.radians(90), 0, 0); s.data.materials.append(COPPER); objs.append(s)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.055, location=(0, 0.3, 0.2))
    t = bpy.context.active_object; t.data.materials.append(GOLD); objs.append(t)
    for o in objs:
        o.location = o.location * 1.18; o.scale = o.scale * 1.18
    for o in objs:
        bpy.context.view_layer.objects.active = o
    return objs

BUILDERS = [build_quartz, build_magnolia, build_horseshoe, build_drop, build_scallop, build_pine]

# ---------------------------------------------------------------- special overlays
JET = mat('jet', srgb('#7FE3FF'), rough=0.1, coat=1.0, emit=srgb('#39C8FF'), emit_str=1.2)
BASALT = mat('basalt', srgb('#2E2724'), rough=0.6)
EMBER = mat('ember', srgb('#FF6A10'), rough=0.5, emit=(1.0, 0.25, 0.02), emit_str=2.2)
EMBER_HOT = mat('emberhot', srgb('#FFB020'), rough=0.5, emit=(1.0, 0.45, 0.05), emit_str=4.5)

def add_cascade(direction):
    """Cascade: a cyan glass band through the piece and two big gold arrow fins reaching the cell edge."""
    objs = []
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.05, depth=0.86, location=(0, 0, 0.3))
    band = bpy.context.active_object; band.rotation_euler = (0, math.radians(90), 0); band.scale = (1.0, 1.6, 1.0)
    band.data.materials.append(JET); objs.append(band)
    for sgn in (-1, 1):
        bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.15, radius2=0, depth=0.17, location=(sgn * 0.43, 0, 0.32))
        c = bpy.context.active_object; c.rotation_euler = (math.radians(45), math.radians(90 * sgn), 0); c.scale = (1.0, 0.55, 1.0)
        add_mod(c, 'BEVEL', width=0.012, segments=2)
        c.data.materials.append(GOLD); objs.append(c)
    if direction == 'v':
        for o in objs:
            o.location = Matrix.Rotation(math.radians(90), 4, 'Z') @ o.location
            o.rotation_euler.z += math.radians(90)
    return objs

def add_stone_ring(hot):
    """Hot Stone: the piece sits on a rounded basalt stone split by glowing ember cracks."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=0.44, location=(0, 0, 0.02))
    st = bpy.context.active_object; st.scale = (1.0, 1.0, 0.32)
    st.data.materials.append(BASALT)
    add_mod(st, 'DISPLACE', strength=0.04, texture=noise_tex('rock', 0.08))
    bpy.ops.object.shade_smooth()
    objs = [st]
    # ember cracks: thin emissive arcs radiating across the stone's top
    for i in range(9):
        a = i / 9 * math.tau + 0.15
        for k in range(3):
            r = 0.2 + k * 0.08
            bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=0.022, location=(math.cos(a + k * 0.12) * r, math.sin(a + k * 0.12) * r, 0.16 - k * 0.02))
            e = bpy.context.active_object; e.scale = (2.2, 0.6, 0.5); e.rotation_euler.z = a + k * 0.12
            e.data.materials.append(EMBER_HOT if hot else EMBER); objs.append(e)
    return objs

def scale_group(objs, f, dz=0.0):
    for o in objs:
        o.location = o.location * f; o.location.z += dz
        o.scale = o.scale * f

# ---------------------------------------------------------------- crystal, token, blockers
def build_crystal():
    tints = [('#FF4FC0', 300), ('#2FB8FF', 520), ('#B78CFF', 650)]
    objs = []
    for (x, rot, sz), (tint, film) in zip([(-0.22, 36, 0.86), (0.22, -36, 0.86), (0, 0, 1.0)], tints):
        q = build_quartz()[0]
        q.data.materials.clear()
        q.data.materials.append(mat('clear' + tint, srgb(tint), rough=0.03, coat=1.0, trans=0.1, ior=1.6, film=film, emit=srgb(tint), emit_str=0.12))
        q.rotation_euler = (math.radians(-10), 0, math.radians(90 + rot)); q.scale = (sz, sz, sz)
        q.location = (x, 0.02, 0.05)
        objs.append(q)
    return objs

def build_token():
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.34, depth=0.09, location=(0, 0, 0.06))
    c = bpy.context.active_object; c.data.materials.append(GOLD)
    add_mod(c, 'BEVEL', width=0.025, segments=4)
    objs = [c]
    bpy.ops.mesh.primitive_torus_add(major_radius=0.27, minor_radius=0.018, location=(0, 0, 0.11))
    objs.append(bpy.context.active_object); objs[-1].data.materials.append(GOLD)
    # abstract bathhouse in relief: a block with an arched door and a dome; no lettering
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.03, 0.12)); b = bpy.context.active_object; b.scale = (0.3, 0.16, 0.03)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.08, location=(0, 0.06, 0.12)); d = bpy.context.active_object; d.scale = (1, 1, 0.4)
    for o in (b, d): o.data.materials.append(mat('brassdk', srgb('#9C6A1C'), metallic=1.0, rough=0.35)); objs.append(o)
    return objs

def build_stone(layers):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=5, radius=0.36, location=(0, 0, 0.14))
    o = bpy.context.active_object; o.scale = (1.08, 1.0, 0.55)
    tone = {1: '#A3967A', 2: '#7A705D', 3: '#544B3D'}[layers]
    o.data.materials.append(mat(f'tufa{layers}', srgb(tone), rough=0.85))
    add_mod(o, 'DISPLACE', strength=0.06 + 0.02 * layers, texture=noise_tex(f'tufa{layers}', 0.12))
    pits = bpy.data.textures.get('pits') or bpy.data.textures.new('pits', 'VORONOI'); pits.noise_scale = 0.05
    add_mod(o, 'DISPLACE', strength=-0.025, texture=pits)
    bpy.ops.object.shade_smooth()
    objs = [o]
    # layer studs: one brass pip per layer so the count reads without colour
    for i in range(layers):
        # layer studs along the lower rim (not in the middle, where two of them read as eyes)
        ang = math.radians(-90 + (i - (layers - 1) / 2) * 32)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.075, location=(math.cos(ang) * 0.27, math.sin(ang) * 0.27, 0.32))
        p = bpy.context.active_object; p.scale = (1, 1, 0.7); p.data.materials.append(GOLD); objs.append(p)
    return objs

def build_lock(layers):
    """A padlocked safe: brass chain crossing the cell in an X (two chains for 2 layers) with a big padlock."""
    objs = []
    chainm = GOLD if layers == 1 else STEEL
    def chain(angle, z):
        n = 7
        for i in range(n):
            t = (i - (n - 1) / 2) / ((n - 1) / 2)
            x, y = math.cos(angle) * t * 0.44, math.sin(angle) * t * 0.44
            bpy.ops.mesh.primitive_torus_add(major_radius=0.066, minor_radius=0.027, major_segments=20, minor_segments=8, location=(x, y, z))
            l = bpy.context.active_object
            l.scale = (1.5, 1.0, 1.0)
            l.rotation_euler = ((math.pi / 2) if i % 2 else 0, 0, angle)
            l.data.materials.append(chainm); objs.append(l)
    chain(math.radians(45), 0.42); chain(math.radians(-45), 0.44)
    if layers == 2:
        chain(0.0, 0.46)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.05, 0.5)); body = bpy.context.active_object; body.scale = (0.3, 0.24, 0.1)
    add_mod(body, 'BEVEL', width=0.04, segments=5); body.data.materials.append(GOLD if layers == 1 else DARKIRON); objs.append(body)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.1, minor_radius=0.028, location=(0, 0.1, 0.52))
    sh = bpy.context.active_object; sh.rotation_euler = (math.radians(90), 0, 0); sh.data.materials.append(STEEL); objs.append(sh)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.03, depth=0.02, location=(0, -0.06, 0.6)); k = bpy.context.active_object; k.data.materials.append(DARKIRON if layers == 1 else GOLD); objs.append(k)
    return objs

def build_moss():
    """Algae: a low, glossy carpet of overlapping leafy fronds that spills past the cell edges."""
    objs = []
    import random
    rnd = random.Random(7)
    wet = mat('algae', srgb('#1F7A48'), rough=0.3, coat=0.7, sss=0.3)
    light_ = mat('algae2', srgb('#5FB85A'), rough=0.35, coat=0.5, sss=0.3)
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.42, depth=0.05, location=(0, 0, 0.03))
    base = bpy.context.active_object; base.data.materials.append(wet)
    add_mod(base, 'DISPLACE', strength=0.04, texture=noise_tex('moss', 0.06)); objs.append(base)
    for i in range(44):
        a = rnd.random() * math.tau; r = 0.47 * math.sqrt(rnd.random())
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=0.085, location=(math.cos(a) * r, math.sin(a) * r, 0.07 + rnd.random() * 0.04))
        f = bpy.context.active_object; f.scale = (1.0, 0.38, 0.16)
        f.rotation_euler = (0.25 * (rnd.random() - 0.5), 0.25 * (rnd.random() - 0.5), rnd.random() * math.tau)
        f.data.materials.append(light_ if i % 3 else wet); bpy.ops.object.shade_smooth(); objs.append(f)
    return objs

def build_drain():
    bpy.ops.mesh.primitive_torus_add(major_radius=0.3, minor_radius=0.035, major_segments=48, location=(0, 0, 0.03))
    r = bpy.context.active_object; r.scale.y = 0.6; r.data.materials.append(GOLD)
    objs = [r]
    for i in range(-2, 3):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(i * 0.11, 0, 0.03)); b = bpy.context.active_object; b.scale = (0.025, 0.32 * math.sqrt(1 - (i / 2.6) ** 2), 0.02)
        b.data.materials.append(GOLD); objs.append(b)
    return objs

# ---------------------------------------------------------------- render list
def piece_set(k):
    names = [f'p{k}', f'p{k}h', f'p{k}v', f'p{k}b', f'p{k}B']
    if not wanted(names): return
    clear_models(); BUILDERS[k](); render(f'p{k}')
    clear_models(); BUILDERS[k](); add_cascade('h'); render(f'p{k}h')
    clear_models(); BUILDERS[k](); add_cascade('v'); render(f'p{k}v')
    for hot, nm in ((False, f'p{k}b'), (True, f'p{k}B')):
        if not wanted([nm]): continue
        clear_models(); objs = BUILDERS[k](); scale_group(objs, 0.78, 0.12); add_stone_ring(hot); render(nm)

for k in range(6):
    piece_set(k)
if wanted(['crystal']): clear_models(); build_crystal(); render('crystal')
if wanted(['token']): clear_models(); build_token(); render('token')
for l in (1, 2, 3):
    if wanted([f'stone{l}']): clear_models(); build_stone(l); render(f'stone{l}')
for l in (1, 2):
    if wanted([f'lock{l}']):
        clear_models(); build_lock(l); ground.is_shadow_catcher = True; render(f'lock{l}')
if wanted(['moss']): clear_models(); build_moss(); render('moss')
if wanted(['drain']): clear_models(); build_drain(); render('drain')
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pieces.blend'))
print('done')
