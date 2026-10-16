// Maps each category id (from categories.js) to its questions file.
// Add one line per category as you create its JSON file.
// The id must match the `id` in categories.js (web, mobile, cyber, ai, ...).

const QUESTION_BANK = {

  web: require("../questions/web-development.json"),
  mobile: require("../questions/mobile-app-development.json"),
  cyber: require("../questions/cybersecurity.json"),
  ai: require("../questions/artificial-Intelligence.json"),
  blockchain: require("../questions/blockchain-technology.json"),
  cloud: require("../questions/cloud-computing.json"),
  graphics: require("../questions/computer-graphics-and-animation.json"),
  networking: require("../questions/networking.json"),
  data: require("../questions/data-science.json"),
  database: require("../questions/database-management.json"),
  desktop: require("../questions/desktop-application-development.json"),
  devops: require("../questions/devOps-and-Infrastructure.json"),
  game: require("../questions/game-development.json"),
  iot: require("../questions/Internet-of-things.json"),
  ml: require("../questions/machine-learning.json"),
  software: require("../questions/software-engineering.json"),


  // ai: require("../questions/artificial-Intelligence.json"),
};

export function getQuestions(categoryId) {
  return QUESTION_BANK[categoryId] || [];
}