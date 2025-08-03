import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "miniai",
  // Add your Inngest event key if using Inngest Cloud
  // eventKey: process.env.INNGEST_EVENT_KEY,
});