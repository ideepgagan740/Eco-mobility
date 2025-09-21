// src/config/bullmq.js
const { Queue, Worker } = require("bullmq");
const redis = require("./redis");

const QUEUE_NAME = "bookingQueue";

function makeQueue(name = QUEUE_NAME) {
  const queue = new Queue(name, { connection: redis });
  return queue;
}

function makeWorker(name, processor, opts = {}) {
  const worker = new Worker(name, processor, { connection: redis, ...opts });
  worker.on("completed", (job, res) => console.log(`[${name}] completed`, job.id, res));
  worker.on("failed", (job, err) => console.error(`[${name}] failed`, job?.id, err?.stack || err));
  return worker;
}

module.exports = { makeQueue, makeWorker, QUEUE_NAME };
