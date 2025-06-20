// In-memory storage (replace with database in production)
const students = new Map();
const teachers = new Map();
let currentPoll = null;
let pollHistory = [];
const pollResponses = new Map();
const chatMessages = [];
const privateMessages = new Map();
const notifications = new Map();

// Getters
function getStudents() {
  return Array.from(students.values());
}
function getTeachers() {
  return Array.from(teachers.values());
}
function getCurrentPoll() {
  return currentPoll;
}
function getPollHistory(limit = 10) {
  return pollHistory.slice(0, limit);
}
function getPollResponses() {
  return pollResponses;
}
function getChatMessages() {
  return chatMessages;
}
function getPrivateMessages() {
  return privateMessages;
}
function getNotifications() {
  return notifications;
}

// Setters/Mutators (add more as needed)
module.exports = {
  students,
  teachers,
  currentPoll,
  pollHistory,
  pollResponses,
  chatMessages,
  privateMessages,
  notifications,
  getStudents,
  getTeachers,
  getCurrentPoll,
  getPollHistory,
  getPollResponses,
  getChatMessages,
  getPrivateMessages,
  getNotifications,
}; 