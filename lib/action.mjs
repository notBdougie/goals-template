import {Octokit} from "octokit"
import { request } from "@octokit/request";
import fs from "fs";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})
// fest authenticated users stars
async function getStars(user) {
  const {data} = await octokit.request('GET /users/{user}/starred', {
    user: user,
  })
  return Promise.all(
    data.map(async repo => {
  
    return {
      full_name: repo.full_name,
      stargazers_count: repo.stargazers_count,
      open_issues_count: repo.open_issues_count,
      forks_count: repo.forks_count
    }
  }))
}

async function getRepoGoals(issues) {
  return Promise.all(
    issues.map(async issue => {
      // all goal issues follow the "owner/repo" format 
      let [owner, name] = issue.title.split("/");
      const {data} = await octokit.repos.get({
        owner: owner,
        repo: name,
      });
      
      return {
        full_name: data.full_name,
        stargazers_count: data.stargazers_count,
        open_issues_count: data.open_issues_count,
        forks_count: data.forks_count
      }
    }),
  );
}

const starsData = await getStars("bdougie")

// goals fetch and combine that with the stars
// fetch all goal repos
const repoIssues = await octokit.paginate(
  octokit.rest.issues.listForRepo.endpoint.merge({
    {full_name: "bdougie/open-sauced-goals"} // bdougie/open-sauced-goals should work with actions/core
  })
);
  
const repoGoalsData = await getRepoGoals(repoIssues)

const finalData = {
  stars: starsData,
  goals: repoGoalsData
}

console.log(data.length);
// create or update the json store
fs.writeFileSync("data.json", JSON.stringify(finalData, null, 2));