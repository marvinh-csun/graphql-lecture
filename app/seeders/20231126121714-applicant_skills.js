'use strict';

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
    var job_skills = []
   for(var i = 1; i < 1000; i++) {
      for(var j = 0; j < (Math.floor(2+Math.random()*10)); j++){
        var s = Math.floor(1+Math.random()*500)
        job_skills.push({
          userId: i,
        	skillId: s
        })
      }
   }

   return queryInterface.bulkInsert('applicantSkills', job_skills)
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
