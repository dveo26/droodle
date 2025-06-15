import { HTTP_BACKEND } from "@/config";
import axios from "axios";
import { fabric } from "fabric";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      type: "ellipse";
      centerX: number;
      centerY: number;
      rx: number;
      ry: number;
    }
  | {
      type: "pencil";
      points: { x: number; y: number }[];
    }
  | {
      type: "line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    };

export async function initDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket
) {
  const fabricCanvas = new fabric.Canvas(canvas);
  const existingShapes: Shape[] = await getExistingShapes(roomId);

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "chat") {
      const parsedShape = JSON.parse(message.message);
      existingShapes.push(parsedShape.shape);
      renderShapes(existingShapes, fabricCanvas);
    }
  };

  renderShapes(existingShapes, fabricCanvas);
}

function renderShapes(shapes: Shape[], canvas: fabric.Canvas) {
  canvas.clear();

  shapes.forEach((shape) => {
    let obj: fabric.Object | null = null;

    switch (shape.type) {
      case "rect":
        obj = new fabric.Rect({
          left: shape.x,
          top: shape.y,
          width: shape.width,
          height: shape.height,
          fill: "",
          stroke: "white",
        });
        break;
      case "circle":
        obj = new fabric.Circle({
          left: shape.centerX - shape.radius,
          top: shape.centerY - shape.radius,
          radius: shape.radius,
          fill: "",
          stroke: "white",
        });
        break;
      case "ellipse":
        obj = new fabric.Ellipse({
          left: shape.centerX - shape.rx,
          top: shape.centerY - shape.ry,
          rx: shape.rx,
          ry: shape.ry,
          fill: "",
          stroke: "white",
        });
        break;
      case "line":
        obj = new fabric.Line(
          [shape.startX, shape.startY, shape.endX, shape.endY],
          {
            stroke: "white",
          }
        );
        break;
      case "pencil":
        const pathData = shape.points
          .map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`)
          .join(" ");
        obj = new fabric.Path(pathData, {
          stroke: "white",
          fill: "",
        });
        break;
    }

    if (obj) canvas.add(obj);
  });

  canvas.renderAll();
}

async function getExistingShapes(roomId: string) {
  const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
  const messages = res.data.messages;

  return messages.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData.shape;
  });
}
