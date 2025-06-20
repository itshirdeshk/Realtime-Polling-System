const { v4: uuidv4 } = require("uuid");

function startPollTimer(currentPoll, io, pollHistory, chatMessages) {
  const timer = setInterval(() => {
    if (!currentPoll || !currentPoll.isActive) {
      clearInterval(timer);
      return;
    }

    currentPoll.timeRemaining--;

    // Send notification when 10 seconds remaining
    if (currentPoll.timeRemaining === 10) {
      const notificationMessage = {
        id: uuidv4(),
        senderId: "system",
        senderName: "System",
        message: `⏰ Only 10 seconds remaining for poll "${currentPoll.question}"! Submit your response quickly!`,
        type: "notification",
        timestamp: new Date().toISOString(),
      };
      chatMessages.push(notificationMessage);
      io.emit("new-message", notificationMessage);
    }

    if (currentPoll.timeRemaining <= 0) {
      currentPoll.isActive = false;
      currentPoll.timeRemaining = 0;
      currentPoll.endedAt = new Date().toISOString();

      // Add to history
      pollHistory.unshift({ ...currentPoll });
      if (pollHistory.length > 10) {
        pollHistory = pollHistory.slice(0, 10);
      }

      io.emit("poll-stopped", currentPoll);
      io.emit("poll-history-updated", pollHistory);
      clearInterval(timer);
    } else {
      io.emit("poll-timer-update", { timeRemaining: currentPoll.timeRemaining });
    }
  }, 1000);
}

module.exports = { startPollTimer }; 