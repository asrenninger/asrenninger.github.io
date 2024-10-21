var Shuffle = window.Shuffle;

var myShuffle = new Shuffle(document.querySelector('.my-shuffle'), {
  itemSelector: '.js-item',
  sizer: '.my-sizer-element',
  buffer: 1,
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const gravityAnimation = {
  cities: [],
  particles: [],
  
  initialize: function(width, height) {
      this.width = width;
      this.height = height;
      
      this.cities = [
          new City(width / 2, height / 2, width / 20, 1000000),
          new City(width / 4, height / 4, width / 35, 500000),
          new City(3 * width / 4, height / 4, width / 35, 500000),
          new City(width / 4, 3 * height / 4, width / 35, 500000),
          new City(3 * width / 4, 3 * height / 4, width / 35, 500000),
          new City(width / 8, height / 2, width / 60, 100000),
          new City(7 * width / 8, height / 2, width / 60, 100000),
          new City(width / 2, height / 8, width / 60, 100000),
          new City(width / 2, 7 * height / 8, width / 60, 100000)
      ];

      this.initializeParticles();
  },

  initializeParticles: function() {
      const calculateGravity = (city1, city2) => {
          const dx = city2.x - city1.x;
          const dy = city2.y - city1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return (city1.population * city2.population) / (distance * distance);
      };

      const totalGravity = this.cities.reduce((sum, city1) =>
          sum + this.cities.reduce((innerSum, city2) =>
              city1 !== city2 ? innerSum + calculateGravity(city1, city2) : innerSum, 0
          ), 0
      );

      const totalParticles = Math.round(1000);

      this.particles = [];
      this.cities.forEach(startCity => {
          this.cities.forEach(endCity => {
              if (startCity !== endCity) {
                  const gravity = calculateGravity(startCity, endCity);
                  const particleCount = Math.round((gravity / totalGravity) * totalParticles);

                  for (let i = 0; i < particleCount; i++) {
                      this.particles.push(new Particle(startCity, endCity));
                  }
              }
          });
      });
  },

  update: function() {
      this.particles.forEach(particle => particle.update());
  },

  draw: function(ctx) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.fillRect(0, 0, this.width, this.height);

      this.cities.forEach(city => city.draw(ctx));
      this.particles.forEach(particle => particle.draw(ctx));
  }
};

class City {
  constructor(x, y, radius, population) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.population = population;
  }

  draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
  }
}

class Particle {
  constructor(startCity, endCity) {
      this.startCity = startCity;
      this.endCity = endCity;
      this.x = startCity.x;
      this.y = startCity.y;
      this.speed = Math.random() * 0.1 + 0.1;
      this.progress = 0;
  }

  update() {
      this.progress += this.speed / 100;
      if (this.progress > 1) {
          this.progress = 0;
          [this.startCity, this.endCity] = [this.endCity, this.startCity];
      }
      this.x = this.startCity.x + (this.endCity.x - this.startCity.x) * this.progress;
      this.y = this.startCity.y + (this.endCity.y - this.startCity.y) * this.progress;
  }

  draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const networkAnimation = {
  nodes: [],
  
  initialize: function(width, height) {
      this.width = width;
      this.height = height;
      
      this.nodes = [];
      for (let i = 0; i < 40; i++) {
          this.nodes.push(new Node(Math.random() * width, Math.random() * height));
      }
  },

  update: function() {
      this.nodes.forEach(node => node.update(this.nodes));
  },

  draw: function(ctx) {
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.fillRect(0, 0, this.width, this.height);

      this.nodes.forEach(node => node.draw(ctx));

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      for (let i = 0; i < this.nodes.length; i++) {
          for (let j = i + 1; j < this.nodes.length; j++) {
              const dx = this.nodes[i].x - this.nodes[j].x;
              const dy = this.nodes[i].y - this.nodes[j].y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < this.width / 3) {
                  ctx.beginPath();
                  ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
                  ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
                  ctx.stroke();
              }
          }
      }
  }
};

class Node {
  constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 1.8;
      this.vy = (Math.random() - 0.5) * 1.8;
      this.baseSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy) * 0.90;
      this.mass = Math.random() * 3 + 1;
  }

  draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.mass * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
  }

  update(nodes) {
      let totalForceX = 0;
      let totalForceY = 0;
      nodes.forEach(other => {
          if (other !== this) {
              const dx = other.x - this.x;
              const dy = other.y - this.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance > 0 && distance < 200) {
                  const force = (0.1 * this.mass * other.mass) / (distance * distance);
                  const angle = Math.atan2(dy, dx);
                  totalForceX += Math.cos(angle) * force;
                  totalForceY += Math.sin(angle) * force;
              }
          }
      });

      this.vx += totalForceX / this.mass;
      this.vy += totalForceY / this.mass;

      const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      const speedFactor = this.baseSpeed / currentSpeed;
      this.vx *= speedFactor;
      this.vy *= speedFactor;

      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const globeVisualization = {
  svg: null,
  container: null,
  gridDensity: 12,
  satellites: 5,
  tiltAngle: 23.5, // Earth's axial tilt

  initialize: function(containerId) {
      this.container = document.getElementById(containerId);
      this.createSVG();
      this.drawGlobe();
      this.drawSatellites();
  },

  createSVG: function() {
      this.svg = this.createElement('svg', {
          viewBox: '-180 -180 360 360',
      });
      this.container.appendChild(this.svg);
  },

  createElement: function(type, attributes = {}) {
      const element = document.createElementNS('http://www.w3.org/2000/svg', type);
      for (const [key, value] of Object.entries(attributes)) {
          element.setAttribute(key, value);
      }
      return element;
  },

  toRad: function(deg) {
      return (deg * Math.PI) / 180;
  },

  project: function(x, y, z) {
      const tilt = this.toRad(this.tiltAngle);
      const xt = x;
      const yt = y * Math.cos(tilt) - z * Math.sin(tilt);
      return [xt, yt];
  },

  rotatePoint: function(point, axis, angle) {
      const [x, y, z] = point;
      const [u, v, w] = axis;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      return [
          (u * (u * x + v * y + w * z) * (1 - cosA) + x * cosA + (-w * y + v * z) * sinA),
          (v * (u * x + v * y + w * z) * (1 - cosA) + y * cosA + (w * x - u * z) * sinA),
          (w * (u * x + v * y + w * z) * (1 - cosA) + z * cosA + (-v * x + u * y) * sinA)
      ];
  },

  generateGridLines: function() {
      const lines = [];
      // Latitude lines
      for (let lat = -90; lat <= 90; lat += 180 / this.gridDensity) {
          const radius = Math.cos(this.toRad(lat));
          const y = Math.sin(this.toRad(lat));
          const points = Array.from({ length: 101 }, (_, i) => {
              const angle = (i / 100) * 2 * Math.PI;
              return this.project(radius * Math.cos(angle), y, radius * Math.sin(angle));
          });
          lines.push(points);
      }
      // Longitude lines
      for (let lon = 0; lon < 360; lon += 360 / this.gridDensity) {
          const points = Array.from({ length: 101 }, (_, i) => {
              const lat = (i / 100) * Math.PI - Math.PI / 2;
              const x = Math.cos(this.toRad(lon)) * Math.cos(lat);
              const y = Math.sin(lat);
              const z = Math.sin(this.toRad(lon)) * Math.cos(lat);
              return this.project(x, y, z);
          });
          lines.push(points);
      }
      return lines;
  },

  generateSatelliteOrbits: function() {
      const orbitConfigurations = [
          { axis: [0, 1, 0], angle: this.toRad(60) },
          { axis: [1, 1, 0], angle: this.toRad(45) },
          { axis: [0, 0, 1], angle: this.toRad(30) },
          { axis: [1, 0, 1], angle: this.toRad(50) },
          { axis: [1, 1, 1], angle: this.toRad(40) },
      ];

      return orbitConfigurations.slice(0, this.satellites).map(({ axis, angle }) => {
          return Array.from({ length: 201 }, (_, j) => {
              const t = (j / 200) * 2 * Math.PI;
              const x = Math.cos(t);
              const y = Math.sin(t);
              const z = 0;
              const rotated = this.rotatePoint([x, y, z], axis, angle);
              return this.project(rotated[0] * 120, rotated[1] * 120, rotated[2] * 120);
          });
      });
  },

  drawGlobe: function() {
      const globeGridLines = this.generateGridLines();

      globeGridLines.forEach(line => {
          const path = this.createElement('path', {
              d: `M ${line.map(([x, y]) => `${x * 100},${y * 100}`).join(' L ')}`,
              fill: 'none',
              stroke: 'white',
              'stroke-width': '1',
              opacity: '0.5'
          });
          this.svg.appendChild(path);
      });
  },

  drawSatellites: function() {
      const satelliteOrbits = this.generateSatelliteOrbits();

      satelliteOrbits.forEach((orbit, i) => {
          const orbitPath = this.createElement('path', {
              d: `M ${orbit.map(([x, y]) => `${x},${y}`).join(' L ')} Z`,
              fill: 'none',
              stroke: 'white',
              'stroke-width': '0.5',
              opacity: '0.3'
          });
          this.svg.appendChild(orbitPath);

          const satellite = this.createElement('circle', {
              r: '4',
              fill: 'white'
          });

          const animateMotion = this.createElement('animateMotion', {
              dur: `${10 + i * 10}s`,
              repeatCount: 'indefinite',
              path: `M ${orbit.map(([x, y]) => `${x},${y}`).join(' L ')} Z`
          });

          satellite.appendChild(animateMotion);
          this.svg.appendChild(satellite);
      });
  },

  update: function() {
      // The globe doesn't need continuous updates
  },

  resize: function() {
      // Adjust SVG viewBox if necessary
  }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Canvas elements
const gravityCanvas = document.getElementById('gravityCanvas');
const networkCanvas = document.getElementById('networkCanvas');
const gravityCtx = gravityCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');

let width, height;

function updateDimensions() {
    width = gravityCanvas.clientWidth;
    height = gravityCanvas.clientHeight;

    gravityCanvas.width = width;
    gravityCanvas.height = height;
    networkCanvas.width = width;
    networkCanvas.height = height;
}

updateDimensions();

// Initialize animations
gravityAnimation.initialize(width, height);
networkAnimation.initialize(width, height);
globeVisualization.initialize('globeCanvas');

// Main animation loop
function animate() {
    // Clear canvases
    gravityCtx.clearRect(0, 0, width, height);
    networkCtx.clearRect(0, 0, width, height);

    // Update and draw each animation
    gravityAnimation.update();
    gravityAnimation.draw(gravityCtx);

    networkAnimation.update();
    networkAnimation.draw(networkCtx);

    // Globe visualization doesn't need continuous updates

    // Request next frame
    requestAnimationFrame(animate);
}

// Start the animation
animate();

// Handle window resize
window.addEventListener('resize', () => {
    updateDimensions();
    gravityAnimation.initialize(width, height);
    networkAnimation.initialize(width, height);
    globeVisualization.resize();
});