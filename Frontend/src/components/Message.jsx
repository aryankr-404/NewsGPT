import React from 'react';
import { MessageSquare, ExternalLink } from 'lucide-react'; // ✅ Import ExternalLink

const Message = ({ message, isUser }) => {

  const renderLink = (text, href) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-blue-400 underline inline-flex items-center space-x-1">
      <span>{text}</span>
      <ExternalLink className="w-3 h-3" />
    </a>
  );

  const renderAIMessage = (content) => {
    if (!content || !content.type) return <p>⚠️ Invalid response</p>;

    switch (content.type) {
      case "headlines":
        return (
          <div>
            <p className="font-semibold mb-2">{content.text}</p>
            <ul className="list-disc ml-5 space-y-1">
              {content.items.map((item, idx) => (
                <li key={idx}>
                  {renderLink(item.title, item.link)}{" "}
                  <span className="text-gray-400 text-sm">
                    ({item.source}, {item.pubDate})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );

      case "detailed":
        return (
          <div>
            <p className="font-semibold mb-2">{content.text}</p>
            <h3 className="text-lg font-bold">{content.article.title}</h3>
            <p className="mb-1">{content.article.content}</p>
            <p className="text-gray-400 text-sm">
              Source: {content.article.source} | Published: {content.article.published}
            </p>
            {renderLink("Read full article", content.article.link)}
          </div>
        );

      case "summary":
        return (
          <div>
            <p className="font-semibold mb-2">{content.text}</p>
            {content.highlights.map((item, idx) => (
              <div key={idx} className="mb-2 p-2 bg-gray-700 rounded">
                <h4 className="font-bold">{item.title}</h4>
                <p>{item.summary}</p>
                {renderLink("Read more", item.link)}
              </div>
            ))}
          </div>
        );

      case "ask_clarification":
        return <p>{content.text}</p>;

      default:
        return <p>⚠️ Unable to serve your request!</p>;
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-3xl px-4 py-3 rounded-lg ${
        isUser 
          ? 'bg-blue-600 text-white ml-auto' 
          : 'bg-gray-800 text-gray-100'
      }`}>
        <div className="flex items-start space-x-3">
          {!isUser && (
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="flex-1">
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {typeof message === 'string' ? message : renderAIMessage(message)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
