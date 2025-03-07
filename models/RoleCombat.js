/*
* Mys幻想真境剧诗数据处理
* */

import lodash from 'lodash'
import moment from 'moment'

import Base from './Base.js'
import Character from './Character.js'
import { Data } from '#miao'

moment.locale('zh-cn')

export default class RoleCombat extends Base {
  constructor (data) {
    super()
    this.rounds = {}
    function getSplendourBuffSummary(level) {
      return {
        'total_level': level,
        'hp_increase': level * 800,
        'atk_increase': level * 50,
        'def_increase': level * 50,
        'em_increase': level * 20
      }
    }
    lodash.forEach(data.detail.rounds_data, (round) => {
      let tmp = {
        is_get_medal: round.is_get_medal,
        choice_cards: round.choice_cards,
        buffs: round.buffs, // TODO: 改版之后这个 buffs 似乎都返回一个空的 list 了
        enemies: round.enemies,
        splendour_buff: {
          summary: getSplendourBuffSummary(round.splendour_buff.summary.total_level),
          buffs: round.splendour_buff.buffs
        }
      }
      let time = moment(new Date(round.finish_time * 1000))
      tmp.finish_time = time.format('MM-DD HH:mm:ss')
      let avatars = []
      lodash.forEach(round.avatars, (avatar) => {
        avatars.push({
          avatar_id: avatar.avatar_id.toString(),
          name: avatar.name,
          avatar_type: avatar.avatar_type,
          level: avatar.level
        })
        // avatar_type:
        // - 1: self
        // - 2: trial
        // - 3: friend support
      })

      tmp.avatars = avatars
      this.rounds[round.round_id] = tmp
    })
    this.stat = data.stat
    this.month = data.schedule.start_date_time.month
    this.stat.total_use_time = data.detail.fight_statisic.total_use_time
  }

  getData () {
    return Data.getData(this, 'rounds,stat,month')
  }

  getOwnAvatars () {
    let ret = {}
    lodash.forEach(this.rounds, (round) => {
      lodash.forEach(round.avatars || [], (avatar) => {
        if (avatar.avatar_id && avatar.avatar_type == 1) {
          ret[avatar.avatar_id] = true
        }
      })
    })
    return lodash.keys(ret)
  }

  getOtherAvatarsData () {
    let ret = {}
    lodash.forEach(this.rounds, (round) => {
      lodash.forEach(round.avatars || [], (avatar) => {
        if (avatar.avatar_id && avatar.avatar_type != 1) {
          let character = new Character({
            id: +avatar.avatar_id,
            name: avatar.name
          })
          let detailInfo = character.getDetail()
          ret[avatar.avatar_id] = {
            id: +avatar.avatar_id,
            name: avatar.name,
            level: avatar.level,
            star: detailInfo.star,
            cons: {
              2: '试用',
              3: '助演'
            }[avatar.avatar_type],
            elem: detailInfo.elem,
            abbr: detailInfo.abbr,
            face: character.face,
            qFace: character.qFace,
            side: character.side,
            gacha: character.gacha
          }
        }
      })
    })
    return ret
  }
}
