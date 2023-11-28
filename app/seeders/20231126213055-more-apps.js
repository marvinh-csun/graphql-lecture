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
    function unique(arr, keyProps) {
      const kvArray = arr.map(entry => {
       const key = keyProps.map(k => entry[k]).join('|');
       return [key, entry];
      });
      const map = new Map(kvArray);
      return Array.from(map.values());
     }
    var set = Array(5000).fill(0).map(ele => {
      return {
        jobPostId: Math.floor(1+Math.random()*2000),
        userId: Math.floor(1+Math.random()*1000)
      }
    })
    set = unique(set,['jobPostId','userId'])
    return queryInterface.bulkInsert('applicantJobPosts',set);
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
