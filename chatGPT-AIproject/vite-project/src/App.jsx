import React,{useState} from 'react';
import { Configuration, OpenAIApi } from "openai";
import readline from "readline";


const configuration = new Configuration({
    organization: "enter your organisation key",
    apiKey:"enter your api key"
});

const openai = new  OpenAIApi(configuration);


function App() {

  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const chat = async (e, message) => {
    e.preventDefault();
    
    if (!message) return;
    setIsTyping(true);
    let msgs = chats;
    msgs.push({ role: "user", content: message });
    setChats(msgs);

    setMessage("");

    await openai
    .createChatCompletion({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content:
            "You are a EbereGPT. You can help with any task",
        },
        ...chats,
      ],
    }).then((res) => {
      msgs.push(res.data.choices[0].message);
      setChats(msgs);
      setIsTyping(false);
    })
    .catch((error) => {
      console.log(error);
    });
  }
  const [text, setText] = useState('');

  const handleFile = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);

        pdfjs.getDocument(data).promise.then((pdfDoc) => {
          let extractedText = '';

          const getPageText = (pageNum) => {
            return pdfDoc.getPage(pageNum).then((page) => {
              return page.getTextContent().then((content) => {
                return content.items.map((item) => item.str).join(' ');
              });
            });
          };

          const processPage = (pageNum) => {
            getPageText(pageNum).then((pageText) => {
              extractedText += `Page ${pageNum}: ${pageText}\n\n`;

              if (pageNum < pdfDoc.numPages) {
                processPage(pageNum + 1);
              } else {
                setText(extractedText);
                console.log('Text extraction complete:', extractedText);
              }
            });
          };

          processPage(1);
        });
      };

      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <main>
      <h1>MishraGPT, How can we help you!</h1>
      <section>
        {chats && chats.length
          ? chats.map((chat, index) => (
              <p key={index} className={chat.role === "user" ? "user_msg" : ""}>
                <span>
                  <b>{chat.role.toUpperCase()}</b>
                </span>
                <span>:</span>
                <span>{chat.content}</span>
              </p>
            ))
          : ""}
      </section>
      <div className={isTyping ? "" : "hide"}>
          <p>
            <i><b>{isTyping ? "Typing...." : ""}</b></i>
          </p>
      </div>
      <form action="" onSubmit={(e) => chat(e, message)}>
        <input
          type="text"
          name="message"
          value={message}
          placeholder="Type a message here and hit Enter..."
          onChange={(e) => setMessage(e.target.value)}
        />
      </form>
      <form>
          <input type="file" id="myFile" name="filename" accept=".pdf"/>
          <input type="submit"/>
      </form>
    </main>
  );
}
export default App;

