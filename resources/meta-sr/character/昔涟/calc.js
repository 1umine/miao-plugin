const getBarrierTrueDmgPct = ({ talent, cons, params }) => {
  let pct = talent.e['额外真实伤害比例']
  if (cons > 1) {
    const e2BuffCount = Math.min(Math.max(params.e2BuffCount || 0, 0), 4)
    pct *= (1 + 0.06 * e2BuffCount)
  }
  return pct
}

const getE4StoryMulti = ({ cons, params }) => {
  if (cons < 4) {
    return 1
  }
  const e4Layer = Math.min(Math.max(params.e4Layer || 0, 0), 24)
  return 1 + e4Layer * 0.06
}

export const details = [{
  title: '普攻·看，希望的起始！',
  dmg: ({ talent, calc, attr }, { basic }) => basic(calc(attr.hp) * talent.a['技能伤害'], 'a')
}, {
  title: '强化普攻·向着爱与明天♪·单体段',
  dmg: ({ talent, calc, attr }, { basic }) => basic(calc(attr.hp) * talent.a2['单体伤害'], 'a2')
}, {
  title: '强化普攻·向着爱与明天♪·群体段(单目标)',
  dmg: ({ talent, calc, attr }, { basic }) => basic(calc(attr.hp) * talent.a2['全体伤害'], 'a2')
}, {
  title: '忆灵技·花与箭的舞曲(单目标)',
  dmg: ({ talent, calc, attr }, { basic }) => basic(calc(attr.hp) * talent.me['技能伤害'], 'me')
}, {
  title: '结界真实伤害·普攻单段',
  dmg: ({ talent, calc, attr, cons, params }, { basic }) => {
    const baseRet = basic(calc(attr.hp) * talent.a['技能伤害'], 'a')
    return {
      avg: baseRet.avg * getBarrierTrueDmgPct({ talent, cons, params })
    }
  }
}, {
  title: ({ params }) => `结界真实伤害·强化普攻整套(按${params.enemyCount}目标)`,
  dmg: ({ talent, calc, attr, cons, params }, { basic }) => {
    const enemyCount = Math.max(params.enemyCount || 1, 1)
    const singleRet = basic(calc(attr.hp) * talent.a2['单体伤害'], 'a2')
    const aoeRet = basic(calc(attr.hp) * talent.a2['全体伤害'], 'a2')
    const totalBase = singleRet.avg + aoeRet.avg * enemyCount
    return {
      avg: totalBase * getBarrierTrueDmgPct({ talent, cons, params })
    }
  }
}, {
  title: ({ params }) => `结界真实伤害·忆灵技整段(按${params.enemyCount}目标)`,
  dmg: ({ talent, calc, attr, cons, params }, { basic }) => {
    const enemyCount = Math.max(params.enemyCount || 1, 1)
    const meRet = basic(calc(attr.hp) * talent.me['技能伤害'], 'me')
    return {
      avg: meRet.avg * enemyCount * getBarrierTrueDmgPct({ talent, cons, params })
    }
  }
}, {
  title: ({ params }) => `献予「真我」之诗弹射总伤害(基础${params.storyBounce}次)`,
  dmg: ({ talent, calc, attr, cons, params }, { basic }) => {
    const baseBounce = Math.max(params.storyBounce || 0, 0)
    const bounceCount = baseBounce + (cons > 0 ? 12 : 0)
    const bounceRet = basic(calc(attr.hp) * talent.me2['「真我」之诗•随机单体伤害'], 'me')
    return {
      avg: bounceRet.avg * bounceCount * getE4StoryMulti({ cons, params })
    }
  }
}]

export const defDmgIdx = 7
export const defParams = {
  Memosprite: true,
  enemyCount: 3,
  e2BuffCount: 4,
  storyBounce: 3,
  e4Layer: 24,
  cons6Triggered: true
}
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
  title: '三相的因果(Buff吃满)：伤害提高[dmg]%，冰属性抗性穿透提高[kx]%',
  tree: 3,
  data: {
    dmg: 20,
    kx: 120
  }
}, {
  title: '等待，在所有的过去：生命上限提高[hp]%',
  data: {
    hp: ({ talent }) => talent.mt['生命上限提高'] * 100
  }
}, {
  title: '2魂：每有1名角色获得忆灵技增益，结界真实伤害倍率提高6%(已计入详情中的真实伤害条目)',
  cons: 2
}, {
  title: '4魂：每次施放【花与箭的舞曲】后，「真我」弹射倍率提高6%(最多24层，已计入详情中的弹射条目)',
  cons: 4
}, {
  title: '6魂：德谬歌在场且至少触发1次时，敌方全体防御力降低[enemyDef]%',
  cons: 6,
  check: ({ params }) => params.cons6Triggered === true,
  data: {
    enemyDef: 20
  }
}]

export const createdBy = 'Lumine'
