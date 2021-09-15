const DB = require("../database/DB")

module.exports = class Player {
  constructor(id) {
    id 
      ? this.id = id 
      : (() => {
        throw new Error(`Cannot read property 'id' of null`)
      })()
  }

  get name() {
    return new Promise((resolve) => {
      resolve(DB.player.getName(this.id))
    })
  }

  get health() {
    return 20
  }

  get attack() {
    return 5
  }

  get inventory() {
    return new Promise((resolve) => {
      resolve(DB.player.getInventory(this.id))
    })
  }

  get pickaxe() {
    return new Promise((resolve) => {
      resolve(DB.player.getPickaxe(this.id))
    })
  }

  get axe() {
    return new Promise((resolve) => {
      resolve(DB.player.getAxe(this.id))
    })
  }

  get weapon() {
    return new Promise((resolve) => {
      resolve(DB.player.getWeapon(this.id))
    })
  }
}