'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     */
    await queryInterface.createTable('users', { 
      id:  {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type:Sequelize.STRING,
        allowNull: false
      }, 
      createdAt: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      },
      updatedAt: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        allowNull: false
      }
    });



    await queryInterface.createTable('companies', {
      id:  {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      logo: Sequelize.STRING
    ,
    createdAt: {
      type: 'TIMESTAMP',
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    },
    updatedAt: {
      type: 'TIMESTAMP',
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      allowNull: false
    }
  })

    await queryInterface.createTable('skills', {
      id:  {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      skill: {
        type: Sequelize.STRING,
        allowNull: false
      }
     
    }
    )

    await queryInterface.createTable('jobPosts', {
      id:  {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      salary: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false
      },
      posterId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        allowNull: false
      },
      companyId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'companies',
          key: 'id'
        },
        allowNull: false
      }
     
    });

    await queryInterface.createTable('applicantEducations',{
      id:  {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      school: Sequelize.STRING,
      degree: Sequelize.STRING,
      major: Sequelize.STRING,
      graduationDate: Sequelize.DataTypes.DATE,
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model:'users',
          key: 'id'
        },
        allowNull: false
      }
     
    });

    await queryInterface.createTable('applicantExperiences',{
      id:  {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      company: Sequelize.STRING,
      title: Sequelize.STRING,
      dateFrom: Sequelize.DATE,
      dateTo: Sequelize.DATE,
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        allowNull: false
      }
     
    });

    await queryInterface.createTable('applicantSkills',{
      id:  {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        allowNull: false
      },
      skillId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'skills',
          key: 'id'
        },
        allowNull: false
      }
     
    });

    await queryInterface.createTable('jobPostSkills',{
      id:  {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      jobId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'jobPosts',
          key: 'id'
        },
        allowNull: false
      },
      skillId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'skills',
          key: 'id'
        },
        allowNull: false
      }
     
    });


    await queryInterface.createTable('roles', { 
      id:  {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: Sequelize.STRING
      
     
    });

    await queryInterface.createTable('userRoles',{
      id:  {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        allowNull: false
      },
      roleId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'roles',
          key: 'id'
        },
        allowNull: false
      }
     
    });

    await queryInterface.createTable('applicantJobPosts',{
      id:  {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        allowNull: false
      },
      jobPostId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'jobPosts',
          key: 'id'
        },
        allowNull: false
      },
      createdAt: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      },
      updatedAt: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        allowNull: false
      }
    }
    );

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     
     */
  }
};
