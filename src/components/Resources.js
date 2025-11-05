import React from 'react';
import { Youtube, FileText, BookOpen, ExternalLink } from 'lucide-react';

const Resources = () => {
  const videoResources = [
    {
      title: "Quantum Computing Explained",
      channel: "Veritasium",
      duration: "22:35",
      description: "A comprehensive introduction to quantum computing fundamentals",
      url: "https://youtube.com/watch?v=JhHMJCUmq28"
    },
    {
      title: "Quantum Algorithms: Shor's Algorithm",
      channel: "Qiskit",
      duration: "18:20",
      description: "Deep dive into Shor's algorithm for factoring large numbers",
      url: "https://youtube.com/watch?v=wUwZZaI5u0c"
    },
    {
      title: "Quantum Machine Learning",
      channel: "IBM Technology ",
      duration: "5:57",
      description: "Exploring the intersection of quantum computing and AI",
      url: "https://www.youtube.com/watch?v=NqHKr9CGWJ0"
    }
  ];

  const articles = [
    {
      title: "Quantum Advantage in Machine Learning",
      source: "Science Magazine",
      readTime: "12 min read",
      description: "Recent breakthroughs in quantum machine learning algorithms",
      url: "https://www.science.org/doi/10.1126/science.abn7293"
    },
    {
      title: "The Case Against Quantum Computing",
      source: "IEEE Spectrum",
      readTime: "8 min read",
      description: "Technical challenges in quantum hardware development",
      url: "https://spectrum.ieee.org/the-case-against-quantum-computing"
    },
    {
      title: "How Space and Time Could Be a Quantum Error-Correcting Code",
      source: "Quanta Magazine",
      readTime: "18 min read",
      description: "Exploring practical quantum applications in the NISQ era",
      url: "https://www.quantamagazine.org/how-space-and-time-could-be-a-quantum-error-correcting-code-20190103/"
    }
  ];

  const books = [
    {
      title: "Quantum Computing: An Applied Approach",
      authors: "Hidary, J.D.",
      publisher: "Springer",
      description: "Comprehensive textbook covering quantum algorithms and implementations",
      url: "https://www.springer.com/gp/book/9783030832735"
    },
    {
      title: "Programming Quantum Computers",
      authors: "Johnston, Harrigan, Gimeno-Segovia",
      publisher: "O'Reilly Media",
      description: "Hands-on guide to quantum programming with practical examples",
      url: "https://www.oreilly.com/library/view/programming-quantum-computers/9781492039679/"
    },
    {
      title: "Quantum Computing: A Gentle Introduction",
      authors: "Rieffel & Polak",
      publisher: "MIT Press",
      description: "Accessible introduction for computer scientists and mathematicians",
      url: "https://mitpress.mit.edu/9780262015066/quantum-computing/"
    }
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Quantum Resources</h1>
        <p className="page-subtitle">
          Curated collection of the best quantum computing videos, articles, and books to accelerate your learning journey
        </p>
      </div>

      <div className="resources-container">
        {/* Video Resources */}
        <div className="card">
          <h2 className="section-title">
            Video Tutorials
          </h2>
          <div className="resource-section">
            {videoResources.map((video, index) => (
              <a
                key={index}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="resource-item"
              >
                <div className="resource-thumbnail">
                  <Youtube size={24} color="#ff6b6b" />
                </div>
                <div className="resource-info">
                  <h3>{video.title}</h3>
                  <p>{video.channel} • {video.duration}</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {video.description}
                  </p>
                </div>
                <ExternalLink size={16} style={{ marginLeft: 'auto', opacity: 0.6 }} />
              </a>
            ))}
          </div>
        </div>

        {/* Article Resources */}
        <div className="card">
          <h2 className="section-title">
            Research Articles
          </h2>
          <div className="resource-section">
            {articles.map((article, index) => (
              <a
                key={index}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="resource-item"
              >
                <div className="resource-thumbnail">
                  <FileText size={24} color="#4ecdc4" />
                </div>
                <div className="resource-info">
                  <h3>{article.title}</h3>
                  <p>{article.source} • {article.readTime}</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {article.description}
                  </p>
                </div>
                <ExternalLink size={16} style={{ marginLeft: 'auto', opacity: 0.6 }} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Books Section - Full Width */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 className="section-title">
          Essential Books
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1rem',
          marginTop: '1rem'
        }}>
          {books.map((book, index) => (
            <a
              key={index}
              href={book.url}
              target="_blank"
              rel="noopener noreferrer"
              className="resource-item"
              style={{ 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                <div className="resource-thumbnail" style={{ width: '50px', height: '70px' }}>
                  <BookOpen size={20} color="#ff9f43" />
                </div>
                <div className="resource-info" style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>{book.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#00d4ff' }}>{book.authors}</p>
                  <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>{book.publisher}</p>
                </div>
                <ExternalLink size={16} style={{ opacity: 0.6 }} />
              </div>
              <p style={{ 
                fontSize: '0.85rem', 
                marginTop: '1rem', 
                lineHeight: '1.4',
                color: '#b0b0c0'
              }}>
                {book.description}
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <h2 className="section-title" style={{ justifyContent: 'center' }}>
          Quick Access Links
        </h2>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '2rem', 
          flexWrap: 'wrap',
          marginTop: '1.5rem'
        }}>
          {[
            { name: 'IBM Qiskit', url: 'https://qiskit.org', color: '#00d4ff' },
            { name: 'Google Cirq', url: 'https://quantumai.google/cirq', color: '#4ecdc4' },
            { name: 'Microsoft Q#', url: 'https://quantum.microsoft.com/', color: '#ff6b6b' },
            { name: 'Rigetti Forest', url: 'https://rigetti.com', color: '#ff9f43' },
            { name: 'PennyLane', url: 'https://pennylane.ai', color: '#a8e6cf' }
          ].map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: `${link.color}20`,
                color: link.color,
                borderRadius: '2rem',
                textDecoration: 'none',
                border: `1px solid ${link.color}40`,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = `${link.color}30`;
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = `${link.color}20`;
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <span>{link.name}</span>
              <ExternalLink size={14} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Resources;