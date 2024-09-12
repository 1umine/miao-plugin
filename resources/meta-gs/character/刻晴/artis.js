export default function ({ attr, rule, def }) {
  // 激化精通璃月雷神，具体数值待定
  if (attr.mastery >= 50) {
    return rule('刻晴-激化', { atk: 75, cpct: 100, cdmg: 100, mastery: 50, dmg: 100 })
  }
  return def({ atk: 75, cpct: 100, cdmg: 100, dmg: 100, phy: 100 })
}
