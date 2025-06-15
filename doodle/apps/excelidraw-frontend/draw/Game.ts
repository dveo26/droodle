import { fabric } from "fabric";
import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shape =
  | {
      type: "rect";
      left: number;
      top: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      left: number;
      top: number;
      radius: number;
    }
  | {
      type: "line";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }
  | {
      type: "pencil";
      path: string;
    }
  | {
      type: "text";
      left: number;
      top: number;
      text: string;
      fontSize: number;
    };

export class Game {
  private fabricCanvas: fabric.Canvas;
  private roomId: string;
  private selectedTool: Tool = "pointer";
  socket: WebSocket;
  private onToolChange: ((tool: Tool) => void) | null = null;
  private isDragging: boolean = false;
  private lastPosX: number = 0;
  private lastPosY: number = 0;
  private zoomLevel: number = 1;

  constructor(
    canvasEl: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket,
    onToolChange?: (tool: Tool) => void
  ) {
    // Set canvas dimensions
    canvasEl.width = window.innerWidth;
    canvasEl.height = window.innerHeight;

    this.fabricCanvas = new fabric.Canvas(canvasEl, {
      selection: true,
      backgroundColor: "#000000",
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      this.fabricCanvas.setWidth(window.innerWidth);
      this.fabricCanvas.setHeight(window.innerHeight);
      this.fabricCanvas.renderAll();
    });

    this.roomId = roomId;
    this.socket = socket;
    this.onToolChange = onToolChange || null;

    this.init();
    this.initHandlers();
    this.initZoomAndPan();
  }

  private initZoomAndPan() {
    // Handle zoom with mouse wheel
    this.fabricCanvas.on("mouse:wheel", (opt) => {
      const delta = opt.e.deltaY;
      let zoom = this.fabricCanvas.getZoom();
      zoom *= 0.999 ** delta;

      // Limit zoom between 0.1 and 5
      zoom = Math.min(Math.max(0.1, zoom), 5);

      // Get mouse position
      const mouseX = opt.e.offsetX;
      const mouseY = opt.e.offsetY;

      // Calculate new zoom center
      const zoomPoint = new fabric.Point(mouseX, mouseY);

      // Apply zoom
      this.fabricCanvas.zoomToPoint(zoomPoint, zoom);
      this.zoomLevel = zoom;

      // Update stroke widths for all objects
      this.updateStrokeWidths();

      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // Handle panning with middle mouse button or Alt + Left click
    this.fabricCanvas.on("mouse:down", (opt) => {
      if (opt.e.button === 1 || (opt.e.altKey && opt.e.button === 0)) {
        this.isDragging = true;
        this.fabricCanvas.selection = false;
        this.lastPosX = opt.e.clientX;
        this.lastPosY = opt.e.clientY;
      }
    });

    this.fabricCanvas.on("mouse:move", (opt) => {
      if (this.isDragging) {
        const vpt = this.fabricCanvas.viewportTransform;
        if (!vpt) return;

        const deltaX = opt.e.clientX - this.lastPosX;
        const deltaY = opt.e.clientY - this.lastPosY;

        vpt[4] += deltaX;
        vpt[5] += deltaY;

        this.fabricCanvas.requestRenderAll();

        this.lastPosX = opt.e.clientX;
        this.lastPosY = opt.e.clientY;
      }
    });

    this.fabricCanvas.on("mouse:up", () => {
      this.isDragging = false;
      this.fabricCanvas.selection = true;
    });

    // Set initial viewport transform
    this.fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  }

  private updateStrokeWidths() {
    const baseStrokeWidth = 2;
    const scaledStrokeWidth = baseStrokeWidth / this.zoomLevel;

    this.fabricCanvas.getObjects().forEach((obj) => {
      if (
        obj instanceof fabric.Path ||
        obj instanceof fabric.Rect ||
        obj instanceof fabric.Circle ||
        obj instanceof fabric.Line
      ) {
        (obj as fabric.Object).set({ strokeWidth: scaledStrokeWidth });
      }
    });
    this.fabricCanvas.requestRenderAll();
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;

    // Remove all existing event listeners
    this.fabricCanvas.off("mouse:down");
    this.fabricCanvas.off("mouse:move");
    this.fabricCanvas.off("mouse:up");

    // Reset all tools
    this.fabricCanvas.isDrawingMode = false;
    this.fabricCanvas.selection = true;
    this.fabricCanvas.forEachObject((obj) => {
      obj.selectable = true;
      // Exit text editing mode when switching tools
      if (obj instanceof fabric.IText) {
        obj.exitEditing();
        if (tool === "pointer") {
          obj.selectable = false;
        }
      }
    });

    // Configure the selected tool
    switch (tool) {
      case "pointer":
        this.fabricCanvas.selection = true;
        // Disable text editing for all text objects
        this.fabricCanvas.getObjects().forEach((obj) => {
          if (obj instanceof fabric.IText) {
            obj.selectable = false;
            obj.exitEditing();
          }
        });
        break;
      case "pencil":
        this.fabricCanvas.isDrawingMode = true;
        this.fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(
          this.fabricCanvas
        );
        this.fabricCanvas.freeDrawingBrush.color = "#ffffff";
        this.fabricCanvas.freeDrawingBrush.width = 2 / this.zoomLevel;
        break;
      case "rect":
      case "circle":
      case "line":
        this.fabricCanvas.on("mouse:down", this.startDrawing.bind(this));
        this.fabricCanvas.on("mouse:move", this.continueDrawing.bind(this));
        this.fabricCanvas.on("mouse:up", this.endDrawing.bind(this));
        break;
      case "text":
        // Enable text editing for all text objects
        this.fabricCanvas.getObjects().forEach((obj) => {
          if (obj instanceof fabric.IText) {
            obj.selectable = true;
          }
        });
        this.fabricCanvas.on("mouse:down", this.addText.bind(this));
        break;
    }

    this.fabricCanvas.requestRenderAll();
  }

  private startDrawing(e: fabric.IEvent<MouseEvent>) {
    const pointer = this.fabricCanvas.getPointer(e.e);
    let obj: fabric.Object | null = null;
    const strokeWidth = 2 / this.zoomLevel;

    switch (this.selectedTool) {
      case "rect":
        obj = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: "transparent",
          stroke: "#ffffff",
          strokeWidth: strokeWidth,
          selectable: false,
        });
        break;
      case "circle":
        obj = new fabric.Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 1,
          fill: "transparent",
          stroke: "#ffffff",
          strokeWidth: strokeWidth,
          selectable: false,
        });
        break;
      case "line":
        obj = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: "#ffffff",
          strokeWidth: strokeWidth,
          selectable: false,
        });
        break;
    }

    if (obj) {
      this.fabricCanvas.add(obj);
      this.fabricCanvas.setActiveObject(obj);
    }
  }

  private continueDrawing(e: fabric.IEvent<MouseEvent>) {
    const activeObj = this.fabricCanvas.getActiveObject();
    if (!activeObj) return;

    const pointer = this.fabricCanvas.getPointer(e.e);

    switch (this.selectedTool) {
      case "rect":
        if (activeObj instanceof fabric.Rect) {
          const width = pointer.x - activeObj.left!;
          const height = pointer.y - activeObj.top!;
          activeObj.set({
            width: Math.abs(width),
            height: Math.abs(height),
          });
        }
        break;
      case "circle":
        if (activeObj instanceof fabric.Circle) {
          const radius =
            Math.max(
              Math.abs(pointer.x - activeObj.left!),
              Math.abs(pointer.y - activeObj.top!)
            ) / 2;
          const centerX = activeObj.left! + (pointer.x - activeObj.left!) / 2;
          const centerY = activeObj.top! + (pointer.y - activeObj.top!) / 2;
          activeObj.set({
            radius,
            left: centerX - radius,
            top: centerY - radius,
          });
        }
        break;
      case "line":
        if (activeObj instanceof fabric.Line) {
          activeObj.set({ x2: pointer.x, y2: pointer.y });
        }
        break;
    }

    this.fabricCanvas.requestRenderAll();
  }

  private endDrawing() {
    const activeObj = this.fabricCanvas.getActiveObject();
    if (!activeObj) return;

    // Make the shape selectable after drawing is complete
    activeObj.set({ selectable: true });

    const shape = this.shapeToPayload(activeObj);
    if (shape) {
      console.log("Sending shape:", shape);
      this.socket.send(
        JSON.stringify({
          type: "chat",
          message: JSON.stringify({ shape }),
          roomId: this.roomId,
        })
      );
    }

    // Switch to pointer tool after drawing
    this.selectedTool = "pointer";
    if (this.onToolChange) {
      this.onToolChange("pointer");
    }
    this.setTool("pointer");
  }

  private addText(e: fabric.IEvent<MouseEvent>) {
    const pointer = this.fabricCanvas.getPointer(e.e);
    const text = new fabric.IText("", {
      left: pointer.x,
      top: pointer.y,
      fill: "#ffffff",
      fontSize: 20,
      selectable: true,
    });

    this.fabricCanvas.add(text);
    this.fabricCanvas.setActiveObject(text);
    text.enterEditing();
  }

  private shapeToPayload(obj: fabric.Object): Shape | null {
    if (obj instanceof fabric.Rect) {
      return {
        type: "rect",
        left: obj.left || 0,
        top: obj.top || 0,
        width: obj.width || 0,
        height: obj.height || 0,
      };
    } else if (obj instanceof fabric.Circle) {
      return {
        type: "circle",
        left: obj.left || 0,
        top: obj.top || 0,
        radius: obj.radius || 0,
      };
    } else if (obj instanceof fabric.Line) {
      return {
        type: "line",
        x1: obj.x1 || 0,
        y1: obj.y1 || 0,
        x2: obj.x2 || 0,
        y2: obj.y2 || 0,
      };
    } else if (obj instanceof fabric.Path && obj.path) {
      return {
        type: "pencil",
        path: obj.path.toString(),
      };
    } else if (obj instanceof fabric.IText) {
      return {
        type: "text",
        left: obj.left || 0,
        top: obj.top || 0,
        text: obj.text || "",
        fontSize: obj.fontSize || 20,
      };
    }
    return null;
  }

  async init() {
    try {
      const shapes = await getExistingShapes(this.roomId);
      console.log("Fetched shapes:", shapes);
      this.renderShapes(shapes);
    } catch (error) {
      console.error("Error fetching shapes:", error);
    }
  }

  private isShapeAtPosition(shape: Shape, x: number, y: number): boolean {
    if (shape.type === "line") {
      return Math.abs(shape.x1 - x) < 1 && Math.abs(shape.y1 - y) < 1;
    }
    if (shape.type === "pencil") {
      return false; // Pencil paths don't have a single position
    }
    return Math.abs(shape.left - x) < 1 && Math.abs(shape.top - y) < 1;
  }

  renderShapes(shapes: Shape[]) {
    shapes.forEach((shape) => {
      // Check if this shape already exists
      const existingShapes = this.fabricCanvas.getObjects();
      const shapeExists = existingShapes.some((obj) => {
        const existingShape = this.shapeToPayload(obj);
        if (!existingShape || existingShape.type !== shape.type) return false;

        if (shape.type === "line") {
          return this.isShapeAtPosition(existingShape, shape.x1, shape.y1);
        }
        if (shape.type === "pencil") {
          return false; // Pencil paths are always new
        }
        return this.isShapeAtPosition(existingShape, shape.left, shape.top);
      });

      if (shapeExists) {
        return; // Skip if shape already exists
      }

      let obj: fabric.Object | null = null;
      const strokeWidth = 2 / this.zoomLevel;

      if (shape.type === "rect") {
        obj = new fabric.Rect({
          left: shape.left,
          top: shape.top,
          width: shape.width,
          height: shape.height,
          fill: "transparent",
          stroke: "#ffffff",
          strokeWidth: strokeWidth,
          selectable: true,
        });
      } else if (shape.type === "circle") {
        obj = new fabric.Circle({
          left: shape.left,
          top: shape.top,
          radius: shape.radius,
          fill: "transparent",
          stroke: "#ffffff",
          strokeWidth: strokeWidth,
          selectable: true,
        });
      } else if (shape.type === "line") {
        obj = new fabric.Line([shape.x1, shape.y1, shape.x2, shape.y2], {
          stroke: "#ffffff",
          strokeWidth: strokeWidth,
          selectable: true,
        });
      } else if (shape.type === "pencil") {
        fabric.Path.fromObject({ path: shape.path }, (path: fabric.Path) => {
          path.set({
            stroke: "#ffffff",
            strokeWidth: strokeWidth,
            fill: "transparent",
            selectable: true,
          });
          this.fabricCanvas.add(path);
          this.fabricCanvas.renderAll();
        });
        return;
      } else if (shape.type === "text") {
        obj = new fabric.IText(shape.text, {
          left: shape.left,
          top: shape.top,
          fill: "#ffffff",
          fontSize: shape.fontSize,
          selectable: true,
        });
      }

      if (obj) {
        this.fabricCanvas.add(obj);
        this.fabricCanvas.renderAll();
      }
    });
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received message:", message);

      if (message.type === "chat") {
        const data = JSON.parse(message.message);
        console.log("Parsed message data:", data);

        if (data.shape) {
          // Handle shape creation/modification
          const shape = data.shape as Shape;
          console.log("Received shape:", shape);

          // Check if this is a modification of an existing shape
          const existingShapes = this.fabricCanvas.getObjects();
          const isModification = existingShapes.some((obj) => {
            const existingShape = this.shapeToPayload(obj);
            if (!existingShape || existingShape.type !== shape.type)
              return false;

            if (shape.type === "line") {
              return this.isShapeAtPosition(existingShape, shape.x1, shape.y1);
            }
            if (shape.type === "pencil") {
              return false; // Pencil paths are always new
            }
            return this.isShapeAtPosition(existingShape, shape.left, shape.top);
          });

          if (!isModification) {
            this.renderShapes([shape]);
          }
        }
      }
    };

    // Handle object modifications
    this.fabricCanvas.on("object:modified", (e) => {
      const obj = e.target;
      if (!obj) return;

      const shape = this.shapeToPayload(obj);
      if (shape) {
        console.log("Sending modified shape:", shape);
        this.socket.send(
          JSON.stringify({
            type: "chat",
            message: JSON.stringify({ shape }),
            roomId: this.roomId,
          })
        );
      }
    });

    // Handle path creation
    this.fabricCanvas.on("path:created", (e: fabric.IEvent<Event>) => {
      if ("path" in e && e.path) {
        const path = e.path as fabric.Path;
        const pathData = path.path;
        if (pathData) {
          const pathShape: Shape = {
            type: "pencil",
            path: pathData.toString(),
          };
          console.log("Sending path shape:", pathShape);
          this.socket.send(
            JSON.stringify({
              type: "chat",
              message: JSON.stringify({ shape: pathShape }),
              roomId: this.roomId,
            })
          );
        }
      }
    });
  }

  private areShapesEqual(shape1: Shape, shape2: Shape): boolean {
    if (shape1.type !== shape2.type) return false;

    switch (shape1.type) {
      case "rect": {
        const rect1 = shape1;
        const rect2 = shape2 as typeof rect1;
        return (
          rect1.left === rect2.left &&
          rect1.top === rect2.top &&
          rect1.width === rect2.width &&
          rect1.height === rect2.height
        );
      }
      case "circle": {
        const circle1 = shape1;
        const circle2 = shape2 as typeof circle1;
        return (
          circle1.left === circle2.left &&
          circle1.top === circle2.top &&
          circle1.radius === circle2.radius
        );
      }
      case "line": {
        const line1 = shape1;
        const line2 = shape2 as typeof line1;
        return (
          line1.x1 === line2.x1 &&
          line1.y1 === line2.y1 &&
          line1.x2 === line2.x2 &&
          line1.y2 === line2.y2
        );
      }
      case "pencil": {
        const pencil1 = shape1;
        const pencil2 = shape2 as typeof pencil1;
        return pencil1.path === pencil2.path;
      }
      case "text": {
        const text1 = shape1;
        const text2 = shape2 as typeof text1;
        return (
          text1.left === text2.left &&
          text1.top === text2.top &&
          text1.text === text2.text &&
          text1.fontSize === text2.fontSize
        );
      }
      default:
        return false;
    }
  }

  destroy() {
    window.removeEventListener("resize", () => {});
    this.fabricCanvas.dispose();
  }
}
