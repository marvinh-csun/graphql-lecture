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
     * 
    */

    return queryInterface.bulkInsert('jobPosts', Array(1000).fill(0).map(ele => {
      return {
        title: ['Web','Graphic', 'Embedded', 'Software', 'Frontend', 'Backend'][Math.floor(Math.random()*6)] + ' ' + ['Engineer', 'Architect', 'Developer'][Math.floor(Math.random()*3)] + ' ' + Math.floor(Math.random()*4)+1,
        salary: Math.floor((Math.random()+0.5)*100000),
        description: faker.lorem.sentence(255),
        location: faker.location.city() + ', ' + faker.location.state(),
        posterId: 4,
        companyId: Math.floor(Math.random()*100+1)
      }
    }));


    
   
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
