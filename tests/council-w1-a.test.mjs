// Council wave 1, batch A: pause round trips, audio lifecycle, Esc, fatal errors, corrupt saves, input during animation.
const WIN_BOARD = ['a b a d e', 'c a c e d', 'd e b d c', 'e d c b e', 'b c e a d'];
async function inLevel(t) {
  await t.game('newGame', { level: 'w1-01', seed: 3, tips: false });
  await t.waitIdle();
}
async function openPause(t) {
  await t.page.locator('#btn-pause').click();
  await t.waitIdle();
  t.equal((await t.state()).scene, 'pause', 'pause scene');
}
const heading = (t) => t.page.locator('#modal h2').innerText();

export const tests = [
  {
    name: 'S6-01 Pause > How to play > Back and Pause > Settings > Done return to the Paused card',
    async run(t) {
      await inLevel(t);
      await openPause(t);
      await t.page.locator('#modal [data-act="help"]').click();
      await t.waitIdle();
      t.equal(await heading(t), 'How to play', 'help is open');
      await t.page.locator('#modal [data-act="close"]').click();
      await t.waitIdle();
      t.equal(await heading(t), 'Paused', 'Back from help returns to Paused');
      t.equal((await t.state()).scene, 'pause', 'scene is pause again');
      await t.page.locator('#modal [data-act="settings"]').click();
      await t.waitIdle();
      t.equal(await heading(t), 'Settings', 'settings is open');
      await t.page.locator('#modal [data-act="close"]').click();
      await t.waitIdle();
      t.equal(await heading(t), 'Paused', 'Done from settings returns to Paused');
      t.equal((await t.state()).scene, 'pause', 'scene is pause again');
    },
  },
];
