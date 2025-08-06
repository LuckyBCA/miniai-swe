import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "miniai",
  // Use event key for local development
  eventKey: process.env.INNGEST_EVENT_KEY,
});