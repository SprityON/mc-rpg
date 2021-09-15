module.exports = class DB {
  static get pool() {
    return require('mysql').createPool({
      timeout: 10000,
      connectionLimit: 50,
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: "mc_rpg"
    })
  }

  static async query(sql, bindings) {
    return new Promise((resolve) => {
      this.pool.getConnection((err, conn) => {
        err
          ? (() => { throw err })()
          : conn.query(sql, bindings, (err, result, fields) => {
            err
              ? (() => { throw err })()
              : resolve([result, fields, err]);
          })
        conn.release();
      })
    })
  }

  static player = {
    getName: async (member_id) => {
      const result = await this.query(`select rpg_name from members where member_id = ${member_id}`)
      return result[0][0].rpg_name
    },

    getInventory: async (member_id) => {
      const result = await this.query(`select inventory from members where member_id = ${member_id}`)
      return JSON.parse(result[0][0].inventory)
    },

    getPickaxe: async (member_id) => {
      const result = await this.query(`select pickaxe from members where member_id = ${member_id}`)
      return JSON.parse(result[0][0].pickaxe) || null
    },

    getAxe: async (member_id) => {
      const result = await this.query(`select axe from members where member_id = ${member_id}`)
      return JSON.parse(result[0][0].axe) || null
    },

    getWeapon: async (member_id) => {
      const result = await this.query(`select weapon from members where member_id = ${member_id}`)
      return JSON.parse(result[0][0].weapon) || null
    }
  }

  static guild = {
    getPrefix: async (guild_id) => {
      const result = await this.query(`select * from guilds where guild_id = ${guild_id}`)
      return result[0][0].prefix
    }
  }
}