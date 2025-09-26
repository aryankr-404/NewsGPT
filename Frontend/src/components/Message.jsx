import React from 'react';
import { MessageSquare } from 'lucide-react';

const Message = ({ message, isUser }) => {

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
                  <a href={item.link} target="_blank" rel="noreferrer" className="text-blue-400 underline">
                    {item.title}
                  </a>{" "}
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
            <a href={content.article.link} target="_blank" rel="noreferrer" className="text-blue-400 underline">
              Read full article
            </a>
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
                <a href={item.link} target="_blank" rel="noreferrer" className="text-blue-400 underline">
                  Read more
                </a>
              </div>
            ))}
          </div>
        );

      case "timeline":
        return (
          <div>
            <p className="font-semibold mb-2">{content.text}</p>
            {content.events.map((event, idx) => (
              <div key={idx} className="mb-2 p-2 bg-gray-700 rounded">
                <span className="font-bold">{event.date}:</span> {event.title}
                <p>{event.description}</p>
                <a href={event.link} target="_blank" rel="noreferrer" className="text-blue-400 underline">
                  More
                </a>
              </div>
            ))}
          </div>
        );

      case "not_found":
        return <p>{content.text}</p>;

      default:
        return <p>⚠️ Unknown response type</p>;
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-3xl px-6 py-4 rounded-lg ${
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
