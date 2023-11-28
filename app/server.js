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


  # type PublicResume implements Resume {

  # }

  type Applicant {
    id: ID!
    jobPostId: Int!
    name: String
    email: String
    skills(matchingSkillsBoolean: Boolean!): [SeekerSkill]
  }

  enum DegreeType {
    MS,
    BS
  }


  type Query {
    applicants(jobPostId: ID!, best: Int): [Applicant]
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
  Query: {
      applicants: (parent,args,context,info) => {
          console.log(args)
          if(!args.best) {
            const all = ApplicantList.genByJobPostId(args.jobPostId)
            return all
          }else{
            const best = ApplicantList.genBestByJobPostId(args.jobPostId,args.best)
            return best
          }
      }
    
    // async topApplicants(_, {jobPostId, topNApplicants, topNApplicantSkills}, context) {
    //   //TOP CANDIDATE IDS BY SKILL MATCH
    //   var results = await sequelize.query(
    //     `SELECT COUNT(jobsearch.applicantSkills.userId) as topId
    //     from 
    //     jobsearch.jobPostSkills
    //     join jobsearch.applicantSkills on jobsearch.applicantSkills.skillId = jobsearch.jobPostSkills.skillId 
    //     WHERE jobsearch.jobPostSkills.jobId  = :jobPostId
    //     GROUP BY jobsearch.jobPostSkills.skillId
    //     ORDER BY COUNT(jobsearch.applicantSkills.userId)
    //     LIMIT :topN
    //     `,
    //     {
    //       replacements: { jobPostId: jobPostId, topN: topNApplicants },
    //       type: QueryTypes.SELECT
    //     }
    //   );
      
    //   const ids = results.map((ele) => ele['topId']);
    //   //GRAB ALL CANDIDATES DEFER RENDERING RESUME
    //   return ApplicantList.genByIds(jobPostId,ids);
      
    // },
    
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