export const details = [{
  title: '普攻·看，希望的起始！',
  dmg: ({ talent, calc, attr }, { basic }) => basic(calc(attr.hp) * talent.a['技能伤害'], 'a')
}, {
  title: '普攻·向着爱与明天',
  dmg: ({ talent, calc, attr }, { basic }) => basic(calc(attr.hp) * talent.a2['单体伤害'], 'a2')
}, {
  title: '忆灵技·花与箭的舞曲',
  dmg: ({ talent, calc, attr }, { basic }) => basic(calc(attr.hp) * talent.me['技能伤害'], 'me')
}]

export const defDmgIdx = 2
export const defParams = { Memosprite: true }
export const mainAttr = 'hp,cpct,cdmg'

export const buffs = [{
  title: '终结技：昔涟和德谬歌暴击率提高[cpct]%',
  data: {
    cpct: ({ talent }) => talent.q['暴击率提高'] * 100
  }
}, {
  title: '众愿啊，汇流如歌：伤害提高[dmg]%',
  data: {
    dmg: ({ talent }) => talent.t['造成的伤害提高'] * 100
  }
}, {
  title: '三相的因果：伤害提高[dmg]%，冰属性抗性穿透提高[kx]%',
  tree: 3,
  data: {
    dmg: 20,
    kx: 120,
  }
}, {
  title: '等待，在所有的过去：生命上限提高[hp]%',
  data: {
    hp: ({ talent }) => talent.mt['生命上限提高'] * 100
  }
}, {
  title: '6魂：德谬歌在场时，敌方全体目标防御力降低20%',
  cons: 6,
  data: {
    def: 20
  }
}]

export const createdBy = 'Lumine'
