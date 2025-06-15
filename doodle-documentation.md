# Droodle Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Core Components](#core-components)
3. [Authentication Flow](#authentication-flow)
4. [Canvas Implementation](#canvas-implementation)
5. [UI Components](#ui-components)
6. [Interview Questions](#interview-questions)

## Project Overview

Droodle is a collaborative whiteboarding application that allows users to create, share, and collaborate on drawings in real-time. The application is built using Next.js, TypeScript, and Fabric.js for canvas manipulation.

## Core Components

### Button Component (`button.tsx`)

```typescript
interface ButtonProps {
  variant: "primary" | "outline";
  className?: string;
  onClick?: () => void;
  size: "lg" | "sm";
  children: ReactNode;
}
```

#### Key Features:

1. **Variant System**
   - Primary: Gradient background with white text
   - Outline: Border with neon glow effect
2. **Size System**

   - Large (lg): px-8 py-3 text-base h-12
   - Small (sm): px-4 py-2 text-sm h-9

3. **Interactive Effects**
   - Scale transform on hover
   - Shadow effects
   - Neon glow for outline variant
   - Smooth transitions

#### Implementation Details:

```typescript
// Base styles with accessibility features
const baseStyles = `
  font-medium
  rounded-xl
  transition-all
  duration-300
  focus:outline-none
  focus:ring-2
  focus:ring-offset-2
  focus:ring-[#9333EA]
  focus:ring-offset-background
  inline-flex
  items-center
  justify-center
  whitespace-nowrap
  disabled:pointer-events-none
  disabled:opacity-50
  active:scale-95
  transform
  will-change-transform
`;

// Size variants with responsive design
const sizeStyles = {
  lg: "px-8 py-3 text-base h-12",
  sm: "px-4 py-2 text-sm h-9",
};

// Interactive effects with performance optimization
const variantStyles = {
  primary: `
    !bg-[#9333EA]
    !text-white
    hover:!bg-[#A855F7]
    hover:scale-105
    hover:shadow-lg
    hover:shadow-[#9333EA]/25
    active:shadow-md
    active:shadow-[#9333EA]/20
  `,
  outline: `
    border-[3px]
    border-[#9333EA]
    text-[#9333EA]
    !bg-[#9333EA]/5
    hover:!bg-[#9333EA]/10
    hover:scale-105
    hover:border-[#A855F7]
    hover:text-[#A855F7]
    [box-shadow:0_0_15px_#9333EA,0_0_30px_#9333EA,0_0_45px_#9333EA,0_0_60px_#9333EA]
    hover:[box-shadow:0_0_20px_#A855F7,0_0_40px_#A855F7,0_0_60px_#A855F7,0_0_80px_#A855F7]
    transition-all
  `,
};
```

### Authentication Flow

#### Sign In Process (`signin/page.tsx`)

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    // API call with error handling
    const response = await api.post("/signin", formData);

    // Token management
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Navigation with success feedback
      toast.success("Sign in successful!");
      router.push("/dashboard");
    } else {
      throw new Error("No token received");
    }
  } catch (error) {
    // Error handling with user feedback
    const errorMessage = error.response?.data?.message || "Error signing in";
    toast.error(errorMessage);
    console.error("Sign in error:", error);
  }
};
```

#### Security Features:

1. Token-based authentication
2. Secure password handling
3. Protected routes
4. Error handling with user feedback

### Canvas Implementation (`Game.ts`)

#### Key Features:

1. **Drawing Tools**

   - Pencil
   - Rectangle
   - Circle
   - Line

2. **Canvas Management**
   - Zoom functionality
   - Pan functionality
   - Stroke width scaling
   - Real-time collaboration

#### Implementation Details:

```typescript
class Game {
  private canvas: fabric.Canvas;
  private zoomLevel: number = 1;
  private isDragging: boolean = false;
  private lastPosX: number = 0;
  private lastPosY: number = 0;

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = new fabric.Canvas(canvasElement, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: "#ffffff",
    });
    this.initHandlers();
    this.initZoomAndPan();
  }

  // Drawing Tools Implementation
  private initHandlers() {
    // Pencil Tool
    this.canvas.on("mouse:down", (opt) => {
      if (this.currentTool === "pencil") {
        this.canvas.isDrawingMode = true;
        this.canvas.freeDrawingBrush.width = 2 / this.zoomLevel;
        this.canvas.freeDrawingBrush.color = "#000000";
      }
    });

    // Shape Tools
    this.canvas.on("mouse:down", (opt) => {
      if (this.currentTool === "rectangle") {
        const rect = new fabric.Rect({
          left: opt.pointer.x,
          top: opt.pointer.y,
          width: 0,
          height: 0,
          fill: "transparent",
          stroke: "#000000",
          strokeWidth: 2 / this.zoomLevel,
        });
        this.canvas.add(rect);
      }
    });
  }

  // Zoom and Pan Implementation
  private initZoomAndPan() {
    // Zoom with mouse wheel
    this.canvas.on("mouse:wheel", (opt) => {
      const delta = opt.e.deltaY;
      const zoom = this.canvas.getZoom();
      const newZoom = Math.min(Math.max(0.1, zoom - delta * 0.001), 5);

      // Calculate zoom point
      const point = {
        x: opt.e.offsetX,
        y: opt.e.offsetY,
      };

      // Apply zoom
      this.canvas.zoomToPoint(point, newZoom);
      this.zoomLevel = newZoom;
      this.updateStrokeWidths();
    });

    // Pan with middle mouse or Alt + Left click
    this.canvas.on("mouse:down", (opt) => {
      if (opt.e.button === 1 || (opt.e.button === 0 && opt.e.altKey)) {
        this.isDragging = true;
        this.lastPosX = opt.e.clientX;
        this.lastPosY = opt.e.clientY;
        this.canvas.selection = false;
      }
    });

    this.canvas.on("mouse:move", (opt) => {
      if (this.isDragging) {
        const deltaX = opt.e.clientX - this.lastPosX;
        const deltaY = opt.e.clientY - this.lastPosY;

        const vpt = this.canvas.viewportTransform;
        if (vpt) {
          vpt[4] += deltaX;
          vpt[5] += deltaY;
          this.canvas.requestRenderAll();
        }

        this.lastPosX = opt.e.clientX;
        this.lastPosY = opt.e.clientY;
      }
    });

    this.canvas.on("mouse:up", () => {
      this.isDragging = false;
      this.canvas.selection = true;
    });
  }

  // Stroke Width Management
  private updateStrokeWidths() {
    const baseWidth = 2;
    const scaledWidth = baseWidth / this.zoomLevel;

    this.canvas.getObjects().forEach((obj) => {
      if ("strokeWidth" in obj) {
        obj.set("strokeWidth", scaledWidth);
      }
    });

    this.canvas.requestRenderAll();
  }
}
```

## Interview Questions

### Frontend Development

1. **Q: How would you implement real-time collaboration in a canvas application?**

   - A: Use WebSocket connections to sync canvas states between users
   - Implement operational transformation or conflict resolution
   - Handle concurrent modifications with proper locking mechanisms
   - Use efficient data structures for state management

2. **Q: Explain the approach to handling zoom and pan in the canvas.**

   - A:
     - Use Fabric.js viewport transformation
     - Implement mouse wheel event handling
     - Scale stroke widths inversely to zoom level
     - Maintain canvas state during transformations

3. **Q: How do you ensure consistent styling across different button variants?**
   - A:
     - Use a base style system
     - Implement variant-specific styles
     - Maintain consistent spacing and sizing
     - Use CSS variables for theming

### System Design

1. **Q: How would you scale this application for millions of users?**

   - A:
     - Implement horizontal scaling
     - Use load balancing
     - Implement caching strategies
     - Optimize database queries
     - Use CDN for static assets

2. **Q: How would you handle offline functionality?**
   - A:
     - Implement local storage for canvas state
     - Use service workers for offline access
     - Implement sync mechanism when online
     - Handle conflicts during sync

### Performance Optimization

1. **Q: How do you optimize canvas performance with many objects?**

   - A:
     - Implement object pooling
     - Use efficient rendering techniques
     - Implement viewport culling
     - Optimize object serialization

2. **Q: How do you handle memory leaks in the canvas application?**
   - A:
     - Proper cleanup of event listeners
     - Object disposal when not needed
     - Memory monitoring
     - Garbage collection optimization

## Best Practices

1. **Code Organization**

   - Use TypeScript for type safety
   - Implement proper error handling
   - Follow component composition patterns
   - Use proper naming conventions

2. **Performance**

   - Implement proper memoization
   - Use efficient rendering techniques
   - Optimize asset loading
   - Implement proper caching

3. **Security**
   - Implement proper authentication
   - Use secure communication
   - Handle sensitive data properly
   - Implement proper authorization

## Future Improvements

1. **Features to Add**

   - More drawing tools
   - Advanced collaboration features
   - Export/import functionality
   - Template system

2. **Technical Improvements**
   - Implement WebGL rendering
   - Add offline support
   - Improve performance
   - Add analytics

## Detailed Implementation Guide

### 1. Button Component Implementation

#### Base Structure

```typescript
// Button.tsx
interface ButtonProps {
  variant: "primary" | "outline";
  className?: string;
  onClick?: () => void;
  size: "lg" | "sm";
  children: ReactNode;
}
```

#### Style System

```typescript
// Base styles with accessibility features
const baseStyles = `
  font-medium
  rounded-xl
  transition-all
  duration-300
  focus:outline-none
  focus:ring-2
  focus:ring-offset-2
  focus:ring-[#9333EA]
  focus:ring-offset-background
  inline-flex
  items-center
  justify-center
  whitespace-nowrap
  disabled:pointer-events-none
  disabled:opacity-50
  active:scale-95
  transform
  will-change-transform
`;

// Size variants with responsive design
const sizeStyles = {
  lg: "px-8 py-3 text-base h-12",
  sm: "px-4 py-2 text-sm h-9",
};

// Interactive effects with performance optimization
const variantStyles = {
  primary: `
    !bg-[#9333EA]
    !text-white
    hover:!bg-[#A855F7]
    hover:scale-105
    hover:shadow-lg
    hover:shadow-[#9333EA]/25
    active:shadow-md
    active:shadow-[#9333EA]/20
  `,
  outline: `
    border-[3px]
    border-[#9333EA]
    text-[#9333EA]
    !bg-[#9333EA]/5
    hover:!bg-[#9333EA]/10
    hover:scale-105
    hover:border-[#A855F7]
    hover:text-[#A855F7]
    [box-shadow:0_0_15px_#9333EA,0_0_30px_#9333EA,0_0_45px_#9333EA,0_0_60px_#9333EA]
    hover:[box-shadow:0_0_20px_#A855F7,0_0_40px_#A855F7,0_0_60px_#A855F7,0_0_80px_#A855F7]
    transition-all
  `,
};
```

### 2. Canvas Implementation Details

#### Game Class Structure

```typescript
class Game {
  private canvas: fabric.Canvas;
  private zoomLevel: number = 1;
  private isDragging: boolean = false;
  private lastPosX: number = 0;
  private lastPosY: number = 0;

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = new fabric.Canvas(canvasElement, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: "#ffffff",
    });
    this.initHandlers();
    this.initZoomAndPan();
  }

  // Drawing Tools Implementation
  private initHandlers() {
    // Pencil Tool
    this.canvas.on("mouse:down", (opt) => {
      if (this.currentTool === "pencil") {
        this.canvas.isDrawingMode = true;
        this.canvas.freeDrawingBrush.width = 2 / this.zoomLevel;
        this.canvas.freeDrawingBrush.color = "#000000";
      }
    });

    // Shape Tools
    this.canvas.on("mouse:down", (opt) => {
      if (this.currentTool === "rectangle") {
        const rect = new fabric.Rect({
          left: opt.pointer.x,
          top: opt.pointer.y,
          width: 0,
          height: 0,
          fill: "transparent",
          stroke: "#000000",
          strokeWidth: 2 / this.zoomLevel,
        });
        this.canvas.add(rect);
      }
    });
  }

  // Zoom and Pan Implementation
  private initZoomAndPan() {
    // Zoom with mouse wheel
    this.canvas.on("mouse:wheel", (opt) => {
      const delta = opt.e.deltaY;
      const zoom = this.canvas.getZoom();
      const newZoom = Math.min(Math.max(0.1, zoom - delta * 0.001), 5);

      // Calculate zoom point
      const point = {
        x: opt.e.offsetX,
        y: opt.e.offsetY,
      };

      // Apply zoom
      this.canvas.zoomToPoint(point, newZoom);
      this.zoomLevel = newZoom;
      this.updateStrokeWidths();
    });

    // Pan with middle mouse or Alt + Left click
    this.canvas.on("mouse:down", (opt) => {
      if (opt.e.button === 1 || (opt.e.button === 0 && opt.e.altKey)) {
        this.isDragging = true;
        this.lastPosX = opt.e.clientX;
        this.lastPosY = opt.e.clientY;
        this.canvas.selection = false;
      }
    });

    this.canvas.on("mouse:move", (opt) => {
      if (this.isDragging) {
        const deltaX = opt.e.clientX - this.lastPosX;
        const deltaY = opt.e.clientY - this.lastPosY;

        const vpt = this.canvas.viewportTransform;
        if (vpt) {
          vpt[4] += deltaX;
          vpt[5] += deltaY;
          this.canvas.requestRenderAll();
        }

        this.lastPosX = opt.e.clientX;
        this.lastPosY = opt.e.clientY;
      }
    });

    this.canvas.on("mouse:up", () => {
      this.isDragging = false;
      this.canvas.selection = true;
    });
  }

  // Stroke Width Management
  private updateStrokeWidths() {
    const baseWidth = 2;
    const scaledWidth = baseWidth / this.zoomLevel;

    this.canvas.getObjects().forEach((obj) => {
      if ("strokeWidth" in obj) {
        obj.set("strokeWidth", scaledWidth);
      }
    });

    this.canvas.requestRenderAll();
  }
}
```

### 3. Authentication Implementation

#### Sign In Process

```typescript
// signin/page.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    // API call with error handling
    const response = await api.post("/signin", formData);

    // Token management
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Navigation with success feedback
      toast.success("Sign in successful!");
      router.push("/dashboard");
    } else {
      throw new Error("No token received");
    }
  } catch (error) {
    // Error handling with user feedback
    const errorMessage = error.response?.data?.message || "Error signing in";
    toast.error(errorMessage);
    console.error("Sign in error:", error);
  }
};
```

#### Token Management

```typescript
// api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);
```

### 4. Real-time Collaboration Implementation

#### WebSocket Connection

```typescript
class CollaborationManager {
  private socket: WebSocket;
  private canvas: fabric.Canvas;
  private roomId: string;

  constructor(canvas: fabric.Canvas, roomId: string) {
    this.canvas = canvas;
    this.roomId = roomId;
    this.initWebSocket();
  }

  private initWebSocket() {
    this.socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/room/${this.roomId}`
    );

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleCanvasUpdate(data);
    };

    this.socket.onclose = () => {
      // Handle reconnection
      setTimeout(() => this.initWebSocket(), 1000);
    };
  }

  private handleCanvasUpdate(data: any) {
    switch (data.type) {
      case "object:added":
        this.canvas.add(fabric.util.enlivenObjects([data.object]));
        break;
      case "object:Modified":
        this.canvas.getObjects().forEach((obj) => {
          if (obj.id === data.object.id) {
            obj.set(data.object);
          }
        });
        break;
      case "object:Removed":
        this.canvas.remove(
          this.canvas.getObjects().find((obj) => obj.id === data.object.id)
        );
        break;
    }
    this.canvas.requestRenderAll();
  }

  public broadcastCanvasUpdate(type: string, object: any) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type,
          object,
          roomId: this.roomId,
        })
      );
    }
  }
}
```

### 5. Performance Optimizations

#### Canvas Rendering

```typescript
class CanvasOptimizer {
  private canvas: fabric.Canvas;
  private renderQueue: any[] = [];
  private isRendering: boolean = false;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.initOptimizations();
  }

  private initOptimizations() {
    // Implement object pooling
    this.objectPool = new Map();

    // Implement viewport culling
    this.canvas.on("object:added", (obj) => {
      this.updateObjectVisibility(obj);
    });

    // Implement render queue
    this.canvas.on("object:modified", () => {
      this.queueRender();
    });
  }

  private queueRender() {
    if (!this.isRendering) {
      this.isRendering = true;
      requestAnimationFrame(() => {
        this.canvas.requestRenderAll();
        this.isRendering = false;
      });
    }
  }

  private updateObjectVisibility(obj: any) {
    const viewport = this.canvas.calcViewportBoundaries();
    const isVisible = obj.intersectsWithRect(viewport);
    obj.visible = isVisible;
  }
}
```

## Conclusion

This documentation provides a comprehensive overview of the Droodle application, its components, and implementation details. It serves as a reference for developers and includes common interview questions related to the technologies and concepts used in the project.
