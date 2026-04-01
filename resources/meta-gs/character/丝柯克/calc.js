function QDmg({ talent, attr, cons }, dmg) {
  return dmg(
    talent.q["斩击伤害"] +
      talent.q["斩击最终段伤害"] +
      (cons === 6 ? 750 * 3 : 0),
    "q",
  )
}

export const details = [
  {
    title: "七相一闪普攻首段伤害",
    params: { cons_2: true },
    dmg: ({ talent, attr }, dmg) => dmg(talent.e["一段伤害"], "a"),
  },
  {
    title: "七相一闪普攻尾段伤害",
    params: { cons_2: true },
    dmg: ({ talent, attr }, dmg) => dmg(talent.e["五段伤害"], "a"),
  },
  {
    title: "七相一闪重击伤害",
    params: { cons_2: true },
    dmg: ({ talent, attr }, dmg) => dmg(talent.e["重击伤害"], "a"),
  },
  {
    title: "Q极恶技·灭6段总伤害",
    params: { Havoc_Ruin: true, Q: true },
    dmg: QDmg,
  },
  {
    title: "丝芙爱莫普攻尾段伤害",
    params: { cons_2: true, team1: true },
    dmg: ({ talent, attr }, dmg) => dmg(talent.e["五段伤害"], "a"),
  },
  {
    title: "丝芙爱莫Q六段总伤",
    params: { Havoc_Ruin: true, team1: true, Q: true },
    dmg: QDmg,
  },
  {
    title: "丝芙1爱4莫Q六段总伤",
    params: { Havoc_Ruin: true, team1: true, team3_extra: true, Q: true },
    dmg: QDmg,
  },
  {
    title: "【千岩勇者】丝芙1爱4莫Q六段总伤",
    params: { Havoc_Ruin: true, team4: true, team3_extra: true, Q: true },
    dmg: QDmg,
  },
  {
    title: "【千岩勇者】丝芙1爱4莫普攻尾段",
    params: { Havoc_Ruin: true, team4: true, team3_extra: true, },
    dmg: ({ talent, attr }, dmg) => dmg(talent.e["五段伤害"], "a"),
  },
  {
    title: "丝芙茜夏普攻尾段伤害",
    params: { cons_2: true, team2: true },
    dmg: ({ talent, attr }, dmg) => dmg(talent.e["五段伤害"], "a"),
  },
  {
    title: "丝芙茜夏Q六段总伤",
    params: { Havoc_Ruin: true, team2: true, Q: true },
    dmg: QDmg,
  },
  {
    title: "七相一闪1命晶刃单次伤害",
    params: { cons_2: true },
    cons: 1,
    dmg: ({}, dmg) => dmg(500, "a2"),
  },
  {
    title: "6命1层极恶技·斩协同攻击伤害",
    cons: 6,
    dmg: ({}, dmg) => dmg(750, "q"),
  },
  {
    title: "6命七相一闪3次协同攻击总伤害",
    params: { cons_2: true },
    cons: 6,
    dmg: ({}, dmg) => dmg(180 * 3, "a"),
  },
  {
    title: "受到伤害时6命七相一闪3次协同攻击总伤害",
    params: { cons_2: true },
    cons: 6,
    dmg: ({}, dmg) => dmg(180 * 3, "a2"),
  },
]

export const defDmgIdx = 1
export const mainAttr = "atk,cpct,cdmg,dmg"

export const buffs = [
  {
    title: "双冰共鸣：攻击冰元素附着或冻结状态下的敌人时，暴击率提高[cpct]%",
    data: {
      cpct: 15,
    },
  },
  {
    check: ({ params }) => params.Havoc_Ruin === true,
    title:
      "丝柯克元素爆发：依据施放时丝柯克拥有的蛇之狡谋超过50点的部分，Q极恶技·灭最多可获得[qPct]%的倍率提升",
    data: {
      qPct: ({ talent, cons }) => {
        let num = cons > 1 ? 22 : 12
        return num * talent.q["蛇之狡谋加成"] * 6
      },
    },
  },
  {
    title: "丝柯克元素爆发：汲取3枚虚境裂隙时，普通攻击造成的伤害提高[aDmg]%",
    data: {
      aDmg: ({ talent }) => talent.q["汲取0/1/2/3枚虚境裂隙伤害提升"][3],
    },
  },
  {
    title:
      "丝柯克天赋：3层死河渡断时，普通攻击造成原本170%的伤害，且元素爆发极恶技·灭造成原本160%的伤害",
    data: {
      aMulti: 70,
      qMulti: 60,
    },
  },
  {
    check: ({ params }) => params.cons_2 === true,
    title:
      "丝柯克2命：施放七相一闪模式下的特殊元素爆发极恶技·尽后的12.5秒内，攻击力提升[atkPct]%",
    cons: 2,
    data: {
      atkPct: 70,
    },
  },
  {
    title: "丝柯克4命：3层死河渡断效果使丝柯克的攻击力提升[atkPct]%",
    cons: 4,
    data: {
      atkPct: 40,
    },
  },
  {
    title: "丝柯克6命：汲取3枚裂隙Q增加3段750%倍率协同伤害",
    check: ({ params }) => params.Q === true,
    cons: 6,
  },
  {
    check: ({ params }) => params.team1 === true || params.team2 === true,
    title: "2命芙宁娜：气氛增伤[dmg]%",
    data: {
      dmg: 100,
    },
  },
  {
    check: ({ params }) => params.team1 === true || params.team4 === true,
    title: "莫娜Q：增伤[dmg]%，宗室提升攻击力[atkPct]%",
    data: {
      dmg: 60,
      atkPct: 20,
    },
  },
  {
    check: ({ params }) => params.team1 === true || params.team4 === true,
    title: "讨龙莫娜：提升攻击力[atkPct]%",
    data: {
      atkPct: 48,
    },
  },
  {
    check: ({ params }) => params.team3_extra === true,
    title: "1爱4莫：暴击率提升[cpct]%，暴击伤害提升[cdmg]%",
    data: {
      cpct: 15,
      cdmg: 60,
    },
  },
  {
    check: ({ params }) => params.team1 === true,
    title: "0命千岩爱可菲：减抗[kx]%，提升攻击力[atkPct]%",
    data: {
      kx: 55,
      atkPct: 20,
    },
  },
  {
    check: ({ params }) => params.team2 === true,
    title: "讨龙宗室夏洛蒂：提升攻击力[atkPct]%",
    data: {
      atkPct: 48 + 20,
    },
  },
  {
    check: ({ params }) => params.team2 === true,
    title: "茜特菈莉：勇者增伤[dmg]%",
    data: {
      dmg: 40,
    },
  },
  {
    check: ({ params }) => params.team4 === true,
    title:
      "千岩芙勇者专爱：芙宁娜增伤100%，提升20%攻击力，爱可菲减抗55%，提升12%伤害，32%攻击力",
    data: {
      dmg: 100 + 12,
      atkPct: 20 + 32,
      kx: 55,
    },
  },
]

export const createdBy = "冰翼"
