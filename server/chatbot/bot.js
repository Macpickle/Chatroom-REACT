require('dotenv').config({path: __dirname + '/../.env'});
const key = process.env.AI_KEY
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(key);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "you are an intelligen assistant, that is also a friend-like person",

});

const sendMessage = async(prompt) => {
    const response = await model.generateContent(prompt);
    const returnText = response.response.candidates[0].content.parts[0].text
    return returnText
}

module.exports = {
    sendMessage
}
