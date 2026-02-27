/**
 * 根据伤害计算矩阵生成提升建议
 * @param {any} dmgCalc - 伤害计算结果对象，包含 dmgCfg.attr 和 dmgRet
 * @returns {Promise<string | null>}
 */
export default async function generateDmgAdvice(dmgCalc) {
  const attrs = dmgCalc?.dmgCfg?.attr || []
  const dmgRet = dmgCalc?.dmgRet || []

  if (!attrs.length || !dmgRet.length || attrs.length !== dmgRet.length) {
    return "数据不足，无法生成建议。"
  }

  const n = attrs.length
  const colScores = new Array(n).fill(0) // 提升收益 (列平均)
  const rowScores = new Array(n).fill(0) // 削减损失 (行平均)
  const swapCandidates = [] // 所有有价值的置换方案

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      // 确保数值可计算
      const val = parseFloat(dmgRet[i][j]?.val) || 0

      colScores[j] += val
      rowScores[i] += val

      // 收集所有有价值的置换 (行 i 换给 列 j)，排除自身互换
      if (i !== j && val > 0) {
        swapCandidates.push({
          val,
          from: i,
          to: j,
          fromTitle: attrs[i].title,
          toTitle: attrs[j].title,
        })
      }
    }
    colScores[i] /= n
    rowScores[i] /= n
  }

  // 优先提升：列平均分最高的前 2 个属性
  const upgradeCandidates = attrs
    .map((a, i) => ({ title: a.title, score: colScores[i] }))
    .sort((a, b) => b.score - a.score)
    .filter((i) => i.score > 0) // 只保留有正收益的
    .slice(0, 2)

  // 替换建议：按收益排序，取前 3 个有价值的置换
  const topSwaps = swapCandidates.sort((a, b) => b.val - a.val).slice(0, 3) // 最多显示 3 个替换建议

  // 保持水平：行平均分最低 (负得最多) 的属性，且损失显著
  const protectCandidate = attrs
    .map((a, i) => ({ title: a.title, score: rowScores[i] }))
    .sort((a, b) => a.score - b.score)
    .find((i) => i.score < -5) // 阈值可根据实际伤害量级调整

  const parts = ["根据当前伤害变化情况"]

  if (upgradeCandidates.length > 0) {
    const titles = upgradeCandidates.map((i) => i.title).join("、")
    parts.push(`【${titles}】词条建议优先提升`)
  } else {
    parts.push("当前属性收益较为均衡")
  }

  if (topSwaps.length > 0) {
    const swapTexts = topSwaps.map(
      (s) => `【${s.fromTitle}】替换为【${s.toTitle}】`,
    )
    if (swapTexts.length === 1) {
      parts.push(`或将 ${swapTexts[0]}`)
    } else {
      parts.push(`或考虑将 ${swapTexts.join("、")}`)
    }
  }

  if (protectCandidate) {
    parts.push(`并注意保持当前的【${protectCandidate.title}】水平`)
  }

  let result = parts[0] + "，"
  const content = parts.slice(1)

  if (content.length === 0) {
    result += "暂无显著提升建议。"
  } else if (content.length === 1) {
    result += content[0] + "。"
  } else {
    result += content.join("，") + "。"
  }

  return result
}
