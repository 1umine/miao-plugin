/**
 * 等效血量计算器
 */

/**
 * 计算抗性对伤害的影响
 * @param {number} kx 当前抗性值
 */
function dmgScale(kx) {
  if (kx < 0) {
    return 1 + kx / 200
  } else if (kx < 75) {
    return 1 - kx / 100
  } else {
    return 1 / ((4 * kx) / 100 + 1)
  }
}

const EqualHpCalc = {
  async handle(e) {
    const msg = (e.original_msg || e.msg || "").replace(/^#等效血量\s*/i, "")
    if (!msg) {
      await e.reply(
        "换算怪物血量到10抗, 用法:\n#等效血量 <怪物血量> <怪物抗性> [队伍减抗]",
      )
      return false
    }
    const args = msg.split(" ")
    let hp = 100
    let resistance = 10
    let teamResistance = 0

    if (args.length >= 1) {
      hp = parseInt(args[0])
    }
    if (args.length >= 2) {
      resistance = parseInt(args[1])
    }
    if (args.length >= 3) {
      teamResistance = parseInt(args[2])
    }

    // 怪物等效血量
    const scale = 0.9 / dmgScale(resistance)
    const equalHp = hp * scale
    const equalDpsScale =
      dmgScale(10 - teamResistance) /
      dmgScale(resistance - teamResistance)
    const sendMsg = [
      `怪物血量: ${hp}\n`,
      `怪物抗性: ${resistance}%\n`,
      `队伍减抗: ${teamResistance}%\n\n`,
      `等效血量(10抗): ${equalHp.toFixed(1)} (${scale.toFixed(2)}倍)\n\n`,
      `如果要打这个怪相对于打10抗木桩DPS大约需要 ${equalDpsScale.toFixed(2)} 倍`,
    ]

    await e.reply(
      `怪物血量: ${hp}\n怪物抗性: ${resistance}%\n
      队伍减抗: ${teamResistance}%\n\n等效血量(10抗): ${equalHp.toFixed(
        2,
      )}\n等效伤害倍率: ${equalDpsScale.toFixed(4)}`,
    )
    return true
  },
}

export default EqualHpCalc
