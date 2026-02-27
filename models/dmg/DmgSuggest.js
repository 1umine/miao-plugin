/**
 * 根据伤害计算矩阵生成提升建议
 * @param {any} dmgCalc - 伤害计算结果对象，包含 dmgCfg.attr 和 dmgRet 
 * @returns {Promise<string | null>}
 */
export default async function generateDmgAdvice(dmgCalc) {
  const attrs = dmgCalc?.dmgCfg?.attr || []
  const dmgRet = dmgCalc?.dmgRet || []

  if (!attrs.length || !dmgRet.length || attrs.length !== dmgRet.length) {
    return null
  }

  // 计算每个属性的“增益潜力”和“损失风险”
  // colScores[j]: 增加属性 j 的平均收益 (列平均)
  // rowScores[i]: 减少属性 i 的平均损失 (行平均，通常为负数，越小越重要)
  const colScores = new Array(attrs.length).fill(0)
  const rowScores = new Array(attrs.length).fill(0)

  let maxVal = -Infinity
  let bestSwap = null // { from: attrName, to: attrName, val: number }

  const n = attrs.length
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const cell = dmgRet[i][j]
      const val = parseFloat(cell.val) || 0

      // 累加列收益 (增加属性 j)
      colScores[j] += val
      // 累加行损失 (减少属性 i)
      rowScores[i] += val

      // 寻找最佳单点置换 (val 最大), 通常对角线 i==j 代表不变，val 应接近 0。寻找 i != j 且 val > 0 的情况
      if (i !== j && val > maxVal) {
        maxVal = val
        bestSwap = {
          from: attrs[i].title,
          fromVal: attrs[i].text,
          to: attrs[j].title,
          toVal: attrs[j].text,
          val: val,
        }
      }
    }
    // 计算平均值
    colScores[i] = colScores[i] / n
    rowScores[i] = rowScores[i] / n
  }

  // 生成属性排名, 计算提升优先级，列平均分越高，提升该属性收益越大
  const upgradeRank = attrs
    .map((a, i) => ({ ...a, score: colScores[i] }))
    .sort((a, b) => b.score - a.score)

  // 核心属性保护：行平均分越低 (负得越多)，该属性越不能动
  const protectRank = attrs
    .map((a, i) => ({ ...a, score: rowScores[i] }))
    .sort((a, b) => a.score - b.score) // 从小到大，负数绝对值大的在前

  // 构建建议文本
  const lines = []
  if (bestSwap && bestSwap.val > 0) {
    lines.push(
      `1. 最佳词条置换：将 [${bestSwap.from} -${bestSwap.fromVal}] 换为 [${bestSwap.to} +${bestSwap.toVal}]`,
    )
    lines.push(`   - 期望伤害提升约：${bestSwap.val.toFixed(0)}`)
  } else {
    lines.push(`1. 当前配置较优，未检测到明显的单词条置换提升空间。`)
  }

  // 优先提升属性
  const topUpgrade = upgradeRank[0]
  if (topUpgrade && topUpgrade.score > 0) {
    lines.push(`2. 优先堆叠属性：建议优先提升 ${topUpgrade.title}`)
    lines.push(
      `   - 该属性平均收益最高，每步变化期望提升约 ${topUpgrade.score.toFixed(0)}`,
    )
  }

  const coreAttr = protectRank[0]
  // 如果核心属性的平均损失很大 (负值绝对值大)
  if (coreAttr && coreAttr.score < -10) {
    lines.push(`3. 请确保 ${coreAttr.title} 不低于当前水平`)
    lines.push(
      `   - 削减该属性会导致伤害大幅下降 (平均损失 ${coreAttr.score.toFixed(0)})`,
    )
  }

  const sample = dmgRet[0][0]
  if (sample && sample.dmg !== sample.avg) {
    lines.push(
      `\n注：以上数据基于期望伤害 (Avg)。若追求爆发，请参考暴击伤害 (Dmg) 列。`,
    )
  }

  return lines.join("\n")
}
