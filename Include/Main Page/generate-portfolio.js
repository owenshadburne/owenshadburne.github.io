import { Project } from "/Include/Main Page/project.js";
import { Category, Skill } from "/Include/Main Page/skills.js";
const projectPath = "/Data/Main Page/projects.json";
const skillsPath = "/Data/Main Page/skills.json";

//TODO: add funcitonality to # in url
async function onDocumentLoad() {
    const projects = await fetchPath(projectPath);
    const skills = await fetchPath(skillsPath);

    populateProjects(projects);
    populateSkills(skills)
}

function populateProjects(projects) {
    const template = document.getElementById("project-template");
    const parent = document.getElementById("projects");

    for (const [name, options] of Object.entries(projects)) {
        const projectObj = new Project(name, options);
        const html = projectObj.createHTML(template);
        parent.append(html);
    }
}

function populateSkills(skills) {
    const categoryTemplate = document.getElementById("category-template");
    const skillTemplate = document.getElementById("skill-template");
    const parent = document.getElementById("skills");

    for (const category in skills) {
        const categoryObj = new Category(category);

        for (const [skill, image] of Object.entries(skills[category])) {
            const skillObj = new Skill(skill, image);
            categoryObj.addSkill(skillObj);
        }

        const html = categoryObj.createHTML(categoryTemplate, skillTemplate);
        parent.append(html);
    }
}

async function fetchPath(path) {
    const response = await fetch(path);
    return response.json();
}

document.addEventListener("DOMContentLoaded", onDocumentLoad);