import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { sequelize } from './db/index.js';
import { QueryTypes } from 'sequelize';

const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  type SeekerSkill {
    id: ID!
    skill: String
  }

  type SeekerEducation {
    school: String
    degree: DegreeType	
    major: String	
    graduationDate: String
  }


  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
  }

  type Applicant {
    id: ID!
    jobPostId: Int!
    name: String
    email: String
    skills(matchingSkillsBoolean: Boolean!): [SeekerSkill]
  }

  type JobPost {
    id: ID!
    title: String!
    salary: String!
    description: String!
    location: String!
    companyId: Int!
    posterId: Int!
  }

  type Company {
    id: ID!	
    name: String!	
    logo: String!
  }

  enum DegreeType {
    MS,
    BS
  }

  union NameSearchResults = User | Company

  type Query {
    applicants(jobPostId: ID!, best: Int): [Applicant]
    nameSearch(companyOrApplicantName: String!): [NameSearchResults]
  }

  type Mutation {
    apply(jobPostId: ID!, applicantId: ID!): String
  }

`;


class Applicant {
  constructor(id, jobPostId, name, email) {
    this.id = id
    this.jobPostId = jobPostId
    this.name = name
    this.email =  email
  }

}

class User {
  constructor(id, firstName, lastName, email) {
    this.id = id
    this.firstName = firstName
    this.lastName = lastName  
    this.email = email
  }
}

class Company {
  constructor(id, name, logo) {
    this.id = id
    this.name = name
    this.logo = logo
  }
}

class ApplicantList {

  static async genBestByJobPostId(jobPostId,best) {
    const data = await sequelize.query(
      `
        SELECT
        COUNT(jobsearch.applicantSkills.userId) as TotalMatches,
        jobsearch.applicantSkills.userId
      from jobsearch.jobPostSkills
      join jobsearch.applicantSkills ON jobsearch.applicantSkills.skillId = jobsearch.jobPostSkills.skillId
      WHERE jobsearch.jobPostSkills.jobId = :jobId1 
      AND jobsearch.applicantSkills.userId in (
          SELECT 
          jobsearch.users.id
          FROM jobsearch.users 
          JOIN jobsearch.applicantJobPosts ON jobsearch.applicantJobPosts.userId = jobsearch.users.id
          WHERE jobsearch.applicantJobPosts.jobPostId = :jobId2
      )
      GROUP BY jobsearch.applicantSkills.userId
        LIMIT :best
      `,
      {
        replacements: { jobId1: jobPostId,jobId2: jobPostId, best: best },
        type: QueryTypes.SELECT
      }
    );

    if (data === null) {
      return null
    }
    console.log(data)
    const applicants = ApplicantList.genByIds(jobPostId,data.map(ele=>ele.userId))

    return applicants

  }

  static async genByJobPostId(jobPostId) {
    const data = await sequelize.query(
      `
      SELECT
      jobsearch.users.id,
      jobsearch.users.firstName,
      jobsearch.users.lastName,
      jobsearch.users.email
      FROM jobsearch.users
      JOIN jobsearch.applicantJobPosts ON jobsearch.applicantJobPosts.userId = jobsearch.users.id
      WHERE jobsearch.applicantJobPosts.jobPostId = :jobPostId
      `,
      {
        replacements: { jobPostId: jobPostId },
        type: QueryTypes.SELECT
      }
    );

    if (data === null) {
      return null
    }

    const applicants =  data.map(ele => {
      return new Applicant(
        `${ele.id}`, 
        jobPostId,
        `${ele.firstName} ${ele.lastName}`,
        ele.email
        )
    })

    return applicants

  }

  static async genByIds(jobPostId,ids) {
    const data = await sequelize.query(
      `
      SELECT 
      jobsearch.users.id,
      jobsearch.users.firstName,
      jobsearch.users.lastName,
      jobsearch.users.email
      FROM jobsearch.users 
      WHERE jobsearch.users.id IN (:ids)
      `,
      {
        replacements: { ids: ids },
        type: QueryTypes.SELECT
      }
    );
    if (data === null) {
      return null
    }
    
    const applicants =  data.map(ele => {
      return new Applicant(
        `${ele.id}`, 
        jobPostId,
        `${ele.firstName} ${ele.lastName}`,
        ele.email
        )
    })

    return applicants

    

  }
}

const resolvers = {
  Applicant: {
    skills: async (parent, args, context, info) => {
      if(args.matchingSkillsBoolean){
        const data = await sequelize.query(
          `
          SELECT *
          FROM jobsearch.skills
          JOIN jobsearch.jobPostSkills ON jobsearch.jobPostSkills.skillId = jobsearch.skills.id
          WHERE jobsearch.jobPostSkills.jobId = :jobId
          AND jobsearch.skills.id IN (
          SELECT 
          jobsearch.skills.id
          FROM jobsearch.applicantSkills
          JOIN jobsearch.skills ON jobsearch.skills.id = jobsearch.applicantSkills.skillId
          WHERE jobsearch.applicantSkills.userId = :id)
          `,
          {
            replacements: { id: parent.id, jobId: parent.jobPostId },
            type: QueryTypes.SELECT
          }
        );
        if (data === null) {
          return null
        }

        return data

      }else{
        const data = await sequelize.query(
          `
          SELECT 
          jobsearch.skills.skill,
          jobsearch.skills.id
          FROM jobsearch.applicantSkills
          JOIN jobsearch.skills ON jobsearch.skills.id = jobsearch.applicantSkills.skillId
          WHERE jobsearch.applicantSkills.userId = :id
          `,
          {
            replacements: { id: parent.id },
            type: QueryTypes.SELECT
          }
        );
        if (data === null) {
          return null
        }
        return data
      }
    }
  },
  Mutation: {
    apply: async (parent, args, context, info) => {
      const data = await sequelize.query(
        `
        INSERT IGNORE INTO jobsearch.applicantJobPosts 
        (userId, jobPostId) 
        VALUES
        (:userId, :jobPostId) 
        `,
        {
          replacements: { userId: args.applicantId, jobPostId: args.jobPostId },
          type: QueryTypes.INSERT
        }
      )

      console.log(data)

      return "Application Sent"

    }
  },
  NameSearchResults: {
    __resolveType: (obj) => {
      console.log(typeof obj)
      if ( obj instanceof User) {
        return 'User'
      }
      if ( obj instanceof Company) {
        return 'Company'
      }
    }
  }
  ,
  Query: {
      applicants: (parent,args,context,info) => {
          if(!args.best) {
            const all = ApplicantList.genByJobPostId(args.jobPostId)
            return all
          }else{
            const best = ApplicantList.genBestByJobPostId(args.jobPostId,args.best)
            return best
          }
      },
      nameSearch: async (parent, args, context, info) => {
        
        const name =  args.companyOrApplicantName
        
        const companies = await sequelize.query(`
        SELECT
        jobsearch.companies.name,
        jobsearch.companies.logo,
        jobsearch.companies.id
        FROM jobsearch.companies WHERE jobsearch.companies.name like :name
        `,{
          replacements: { name: `%${name}%` },
          type: QueryTypes.Query
        })
  
       
        const CompanyList = companies[0].map((ele) => 
          new Company(ele.id, ele.name, ele.logo)
        )
  

        const users = await sequelize.query(`
        SELECT
        jobsearch.users.lastName,
        jobsearch.users.firstName,
        jobsearch.users.id,
        jobsearch.users.email
        FROM jobsearch.users WHERE jobsearch.users.firstName like :name1 OR jobsearch.users.lastName like :name2
        `,{
          replacements: { name1: `%${name}%`, name2: `%${name}%` },
          type: QueryTypes.Query
        })
  
        const UserList = users[0].map(ele => 
          new User(ele.id, ele.firstName, ele.lastName, ele.email)
        )

        return [...CompanyList,...UserList]
      }
    
    
  },


};



// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);