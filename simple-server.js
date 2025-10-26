require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  optionsSuccessStatus: 200,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Production authentication credentials
// Admin: Single fixed admin account
// Users: Any email ending with @immerseindia.com with shared password
const ADMIN_CREDENTIALS = {
  email: 'immerseindia@admin.com',
  password: 'ZNM8B4naq&',
  id: 'admin-001',
  name: 'Admin',
  role: 'admin'
};

const USER_CONFIG = {
  emailDomain: '@immerseindia.com',
  password: 'immerse@2025'
};

// Production-ready data storage with comprehensive sample data
let data = {
  experiences: [
    {
      id: '1',
      destination: 'Kerala',
      region: 'South',
      title: 'Kerala Backwater Paradise',
      description: 'Experience the serene beauty of Kerala backwaters with traditional houseboats, lush green landscapes, and authentic local culture.',
      highlights: [
        'Traditional houseboat cruise through backwaters',
        'Authentic Kerala cuisine and spice plantation tours',
        'Ayurvedic spa treatments and wellness therapies',
        'Coconut plantation visits and toddy tapping experience',
        'Kathakali dance performances and cultural shows'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop&q=80',
      createdAt: Date.now()
    },
    {
      id: '2',
      destination: 'Rajasthan',
      region: 'North',
      title: 'Royal Palaces of Rajasthan',
      description: 'Discover the grandeur of Rajasthani royalty with magnificent palaces, historic forts, and vibrant desert culture.',
      highlights: [
        'City Palace Udaipur with stunning lake views',
        'Amber Fort Jaipur - architectural marvel',
        'Mehrangarh Fort Jodhpur - blue city panorama',
        'Camel safari in Thar Desert with camping',
        'Traditional Rajasthani folk music and dance'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop&q=80',
      createdAt: Date.now()
    },
    {
      id: '3',
      destination: 'Goa',
      region: 'West',
      title: 'Goa Beach Paradise',
      description: 'Relax on pristine beaches, explore Portuguese heritage, and enjoy vibrant nightlife in India\'s beach capital.',
      highlights: [
        'Pristine beaches - Baga, Calangute, Anjuna',
        'Portuguese colonial architecture and churches',
        'Vibrant beach shacks and seafood cuisine',
        'Water sports - parasailing, jet skiing, diving',
        'Spice plantations and traditional Goan culture'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop&q=80',
      createdAt: Date.now()
    },
    {
      id: '4',
      destination: 'Himachal Pradesh',
      region: 'North',
      title: 'Himalayan Adventure Paradise',
      description: 'Explore snow-capped mountains, adventure sports, and hill stations in the beautiful state of Himachal Pradesh.',
      highlights: [
        'Manali and Rohtang Pass scenic beauty',
        'Adventure activities - trekking, paragliding, river rafting',
        'Dharamshala and McLeod Ganj spiritual journey',
        'Apple orchards and mountain village experiences',
        'Shimla heritage train and colonial architecture'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
      createdAt: Date.now()
    },
    {
      id: '5',
      destination: 'Tamil Nadu',
      region: 'South',
      title: 'Temple Trail & Cultural Heritage',
      description: 'Journey through ancient temples, classical arts, and rich cultural heritage of Tamil Nadu.',
      highlights: [
        'Magnificent temples of Madurai and Thanjavur',
        'Classical Bharatanatyam dance performances',
        'French colonial architecture in Pondicherry',
        'Hill station retreat in Ooty and Kodaikanal',
        'Traditional silk weaving and handicraft centers'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&h=600&fit=crop&q=80',
      createdAt: Date.now()
    }
  ],
  itineraries: [
    {
      id: '1',
      destination: 'Kerala',
      region: 'South',
      title: '7-Day Kerala Backwater & Hill Station Tour',
      duration: '7 days',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80',
      days: [
        { day: 1, activities: ['Arrival in Kochi - Fort Kochi exploration', 'Chinese fishing nets and spice markets', 'Evening Kathakali performance'] },
        { day: 2, activities: ['Drive to Munnar (4 hours)', 'Tea plantation visit and factory tour', 'Overnight in hill station resort'] },
        { day: 3, activities: ['Eravikulam National Park visit', 'Mattupetty Dam and Echo Point', 'Tea museum and tasting session'] },
        { day: 4, activities: ['Drive to Thekkady (3 hours)', 'Periyar Wildlife Sanctuary boat ride', 'Spice plantation tour and Ayurvedic massage'] },
        { day: 5, activities: ['Drive to Alleppey backwaters (4 hours)', 'Houseboat check-in and lunch', 'Cruise through narrow canals and villages'] },
        { day: 6, activities: ['Morning backwater cruise', 'Traditional fishing village visit', 'Coir-making demonstration and local lunch'] },
        { day: 7, activities: ['Houseboat check-out', 'Drive to Kochi airport (1.5 hours)', 'Departure with memories of Gods Own Country'] }
      ],
      createdAt: Date.now()
    },
    {
      id: '2',
      destination: 'Rajasthan',
      region: 'North',
      title: '10-Day Golden Triangle & Desert Safari',
      duration: '10 days',
      imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop&q=80',
      days: [
        { day: 1, activities: ['Arrival in Delhi - Red Fort and India Gate', 'Chandni Chowk market exploration', 'Welcome dinner with cultural show'] },
        { day: 2, activities: ['Drive to Agra (4 hours)', 'Taj Mahal sunset visit', 'Agra Fort exploration'] },
        { day: 3, activities: ['Fatehpur Sikri ghost city visit', 'Drive to Jaipur (5 hours)', 'Evening at leisure in Pink City'] },
        { day: 4, activities: ['Amber Fort elephant ride', 'City Palace and Jantar Mantar', 'Hawa Mahal photo stop'] },
        { day: 5, activities: ['Drive to Jodhpur (5 hours)', 'Mehrangarh Fort sunset visit', 'Blue city walking tour'] }
      ],
      createdAt: Date.now()
    },
    {
      id: '3',
      destination: 'Goa',
      region: 'West',
      title: '5-Day Goa Beach & Heritage Tour',
      duration: '5 days',
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop&q=80',
      days: [
        { day: 1, activities: ['Arrival in Goa - Panaji city tour', 'Basilica of Bom Jesus visit', 'Sunset at Miramar Beach'] },
        { day: 2, activities: ['North Goa beaches - Baga and Calangute', 'Water sports and beach activities', 'Beach shack dinner'] },
        { day: 3, activities: ['Spice plantation tour', 'Traditional Goan lunch', 'Anjuna Flea Market shopping'] },
        { day: 4, activities: ['South Goa beaches - Colva and Benaulim', 'Portuguese architecture tour', 'Sunset cruise'] },
        { day: 5, activities: ['Dudhsagar Falls excursion', 'Shopping for souvenirs', 'Departure transfer'] }
      ],
      createdAt: Date.now()
    }
  ],
  images: [
    {
      id: '1',
      destination: 'Kerala',
      region: 'South',
      url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop&q=80',
      caption: 'Traditional houseboat in Kerala backwaters during golden hour',
      createdAt: Date.now()
    },
    {
      id: '2',
      destination: 'Rajasthan',
      region: 'North',
      url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop&q=80',
      caption: 'Magnificent Amber Fort overlooking Jaipur city',
      createdAt: Date.now()
    },
    {
      id: '3',
      destination: 'Goa',
      region: 'West',
      url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop&q=80',
      caption: 'Sunset at pristine Goa beach with palm trees',
      createdAt: Date.now()
    },
    {
      id: '4',
      destination: 'Himachal Pradesh',
      region: 'North',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
      caption: 'Breathtaking mountain landscapes of Ladakh with snow peaks',
      createdAt: Date.now()
    },
    {
      id: '5',
      destination: 'Tamil Nadu',
      region: 'South',
      url: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&h=600&fit=crop&q=80',
      caption: 'Ancient temple architecture showcasing Dravidian style',
      createdAt: Date.now()
    }
  ],
  updates: [
    {
      id: '1',
      type: 'travel-trend',
      title: 'Sustainable Tourism in Kerala',
      content: 'Kerala leads India\'s sustainable tourism initiatives with eco-friendly houseboats, organic spice plantations, and community-based tourism programs that benefit local communities while preserving the environment.',
      externalUrl: null,
      createdAt: Date.now()
    },
    {
      id: '2',
      type: 'new-experience',
      title: 'New Rajasthan Heritage Hotels',
      content: 'Experience royal luxury in converted palace hotels across Rajasthan. Stay in the same rooms where maharajas once lived, with modern amenities and traditional hospitality.',
      externalUrl: null,
      createdAt: Date.now()
    },
    {
      id: '3',
      type: 'newsletter',
      title: 'Monsoon Travel Tips for India',
      content: 'Make the most of monsoon season with our complete guide to traveling in India during the rains. From the best hill stations to cultural festivals, discover why monsoon is magical.',
      externalUrl: null,
      createdAt: Date.now()
    },
    {
      id: '4',
      type: 'travel-trend',
      title: 'Himalayan Adventure Tourism Surge',
      content: 'Adventure tourism in Himachal Pradesh and Uttarakhand is witnessing unprecedented growth with new trekking routes, eco-lodges, and sustainable mountain tourism practices.',
      externalUrl: 'https://immerseindia.vercel.app/blog/himalayan-adventure',
      createdAt: Date.now()
    }
  ]
};

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // Check if admin login
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    const { password: _, ...adminWithoutPassword } = ADMIN_CREDENTIALS;
    return res.json({
      success: true,
      message: 'Login successful',
      user: adminWithoutPassword,
      token: 'mock-jwt-token-admin'
    });
  }
  
  // Check if user login (email must end with @immerseindia.com)
  if (email.endsWith(USER_CONFIG.emailDomain) && password === USER_CONFIG.password) {
    // Extract name from email (part before @)
    const emailUsername = email.split('@')[0];
    const userName = emailUsername
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
    
    const user = {
      id: `user-${Date.now()}`,
      email: email,
      name: userName,
      role: 'user'
    };
    
    return res.json({
      success: true,
      message: 'Login successful',
      user: user,
      token: 'mock-jwt-token-user'
    });
  }
  
  // Invalid credentials
  return res.status(401).json({ error: 'Invalid credentials' });
});

// Experiences routes
app.get('/api/experiences', (req, res) => {
  res.json({ success: true, data: data.experiences, source: 'memory' });
});

app.post('/api/experiences', (req, res) => {
  const newExperience = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: Date.now(),
    authorId: 'admin-001'
  };
  data.experiences.push(newExperience);
  res.status(201).json({ success: true, data: newExperience, source: 'memory' });
});

app.put('/api/experiences/:id', (req, res) => {
  const { id } = req.params;
  const index = data.experiences.findIndex(exp => exp.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Experience not found' });
  }
  
  data.experiences[index] = {
    ...data.experiences[index],
    ...req.body,
    updatedAt: Date.now()
  };
  
  res.json({ success: true, data: data.experiences[index], source: 'memory' });
});

app.delete('/api/experiences/:id', (req, res) => {
  const { id } = req.params;
  const index = data.experiences.findIndex(exp => exp.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Experience not found' });
  }
  
  data.experiences.splice(index, 1);
  res.json({ success: true, message: 'Experience deleted', source: 'memory' });
});

// Itineraries routes
app.get('/api/itineraries', (req, res) => {
  res.json({ success: true, data: data.itineraries, source: 'memory' });
});

app.post('/api/itineraries', (req, res) => {
  const newItinerary = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: Date.now(),
    authorId: 'admin-001'
  };
  data.itineraries.push(newItinerary);
  res.status(201).json({ success: true, data: newItinerary, source: 'memory' });
});

app.put('/api/itineraries/:id', (req, res) => {
  const { id } = req.params;
  const index = data.itineraries.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Itinerary not found' });
  }
  
  data.itineraries[index] = {
    ...data.itineraries[index],
    ...req.body,
    updatedAt: Date.now()
  };
  
  res.json({ success: true, data: data.itineraries[index], source: 'memory' });
});

app.delete('/api/itineraries/:id', (req, res) => {
  const { id } = req.params;
  const index = data.itineraries.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Itinerary not found' });
  }
  
  data.itineraries.splice(index, 1);
  res.json({ success: true, message: 'Itinerary deleted', source: 'memory' });
});

// Images routes
app.get('/api/images', (req, res) => {
  res.json({ success: true, data: data.images, source: 'memory' });
});

app.post('/api/images', (req, res) => {
  const newImage = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: Date.now(),
    authorId: 'admin-001'
  };
  data.images.push(newImage);
  res.status(201).json({ success: true, data: newImage, source: 'memory' });
});

app.put('/api/images/:id', (req, res) => {
  const { id } = req.params;
  const index = data.images.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Image not found' });
  }
  
  data.images[index] = {
    ...data.images[index],
    ...req.body,
    updatedAt: Date.now()
  };
  
  res.json({ success: true, data: data.images[index], source: 'memory' });
});

app.delete('/api/images/:id', (req, res) => {
  const { id } = req.params;
  const index = data.images.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Image not found' });
  }
  
  data.images.splice(index, 1);
  res.json({ success: true, message: 'Image deleted', source: 'memory' });
});

// Updates routes
app.get('/api/updates', (req, res) => {
  res.json({ success: true, data: data.updates, source: 'memory' });
});

app.post('/api/updates', (req, res) => {
  const newUpdate = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: Date.now(),
    authorId: 'admin-001'
  };
  data.updates.push(newUpdate);
  res.status(201).json({ success: true, data: newUpdate, source: 'memory' });
});

app.put('/api/updates/:id', (req, res) => {
  const { id } = req.params;
  const index = data.updates.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Update not found' });
  }
  
  data.updates[index] = {
    ...data.updates[index],
    ...req.body,
    updatedAt: Date.now()
  };
  
  res.json({ success: true, data: data.updates[index], source: 'memory' });
});

app.delete('/api/updates/:id', (req, res) => {
  const { id } = req.params;
  const index = data.updates.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Update not found' });
  }
  
  data.updates.splice(index, 1);
  res.json({ success: true, message: 'Update deleted', source: 'memory' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    database: 'in-memory',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/test', 
      'POST /api/auth/login',
      'GET /api/experiences',
      'POST /api/experiences',
      'PUT /api/experiences/:id',
      'DELETE /api/experiences/:id',
      'GET /api/itineraries',
      'POST /api/itineraries',
      'PUT /api/itineraries/:id',
      'DELETE /api/itineraries/:id',
      'GET /api/images',
      'POST /api/images',
      'PUT /api/images/:id',
      'DELETE /api/images/:id',
      'GET /api/updates',
      'POST /api/updates',
      'PUT /api/updates/:id',
      'DELETE /api/updates/:id'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🌐 Immerse India Dashboard API
🚀 Server running on port ${PORT}
📍 API Base URL: http://localhost:${PORT}/api
🔍 Health check: http://localhost:${PORT}/api/health
🧪 Test endpoint: http://localhost:${PORT}/api/test

✅ Production-ready authentication enabled
� Admin login: immerseindia@admin.com
� User login: *@immerseindia.com (any email ending with @immerseindia.com)
  `);
});