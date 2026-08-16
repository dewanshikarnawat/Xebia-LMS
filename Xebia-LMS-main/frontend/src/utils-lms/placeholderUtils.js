export function getAIPlaceholderImage(name = '', type = 'thumbnail', color = '#0EA89C') {
  const norm = name.toLowerCase();
  let keyword = 'abstract';

  if (norm.includes('program') || norm.includes('code') || norm.includes('develop') || norm.includes('java') || norm.includes('software')) {
    keyword = 'programming';
  } else if (norm.includes('design') || norm.includes('ui') || norm.includes('ux') || norm.includes('creative') || norm.includes('figma') || norm.includes('art')) {
    keyword = 'design';
  } else if (norm.includes('ai') || norm.includes('intelligence') || norm.includes('machine') || norm.includes('deep') || norm.includes('neural')) {
    keyword = 'ai';
  } else if (norm.includes('python')) {
    keyword = 'python';
  } else if (norm.includes('cloud') || norm.includes('aws') || norm.includes('azure') || norm.includes('gcp') || norm.includes('kubernetes')) {
    keyword = 'cloud';
  } else if (norm.includes('security') || norm.includes('cyber') || norm.includes('crypt') || norm.includes('hacking')) {
    keyword = 'cybersecurity';
  } else if (norm.includes('devops') || norm.includes('docker') || norm.includes('jenkins') || norm.includes('ci/cd')) {
    keyword = 'devops';
  } else if (norm.includes('data') || norm.includes('stat') || norm.includes('analyt') || norm.includes('sql') || norm.includes('db') || norm.includes('database')) {
    keyword = 'datascience';
  }

  const map = {
    programming: {
      logo: '💻',
      thumbnail: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=600&q=80',
      banner: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
      background: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    },
    design: {
      logo: '🎨',
      thumbnail: 'https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&w=600&q=80',
      banner: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1200&q=80',
      background: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80',
    },
    ai: {
      logo: '🤖',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80',
      banner: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
      background: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    },
    python: {
      logo: '🐍',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
      banner: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80',
      background: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80',
    },
    cloud: {
      logo: '☁️',
      thumbnail: 'https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&w=600&q=80',
      banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      background: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    },
    cybersecurity: {
      logo: '🔒',
      thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
      banner: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
      background: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    },
    devops: {
      logo: '🚀',
      thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=600&q=80',
      banner: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=1200&q=80',
      background: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=1200&q=80',
    },
    datascience: {
      logo: '📊',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
      banner: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      background: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80',
    },
    abstract: {
      logo: '📚',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      background: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
    }
  };

  const selected = map[keyword] || map.abstract;
  return selected[type] || selected.thumbnail;
}
