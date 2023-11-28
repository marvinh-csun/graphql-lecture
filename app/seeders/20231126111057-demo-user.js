'use strict';

/** @type {import('sequelize-cli').Migration} */

const { faker } = require('@faker-js/faker');
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    var user_array = []
    for(var i = 0; i < 1000; i++){
      var firstName =  faker.person.firstName()
      var lastName  = faker.person.lastName()
      user_array.push(
        {
          firstName: firstName,
          lastName: lastName,
          email: firstName+lastName+'@example.com'
        }
      )
    }
    return queryInterface.bulkInsert('users', user_array);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
