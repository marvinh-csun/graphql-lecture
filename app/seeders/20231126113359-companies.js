'use strict';

const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
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
    var company = []
    for(var i = 0; i < 500; i++){
      company.push(
        {
          name: faker.company.name(),
          logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/CSUNS.svg/800px-CSUNS.svg.png'
        }
      )
    }
    return queryInterface.bulkInsert('companies', company);

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
