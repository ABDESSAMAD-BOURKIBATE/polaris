use anyhow::{Context, Result};
use log::{error, info, warn};
use rdkafka::producer::{FutureProducer, FutureRecord};
use rdkafka::ClientConfig;
use serde::{Deserialize, Serialize};
use sysinfo::{CpuExt, System, SystemExt};
use std::time::Duration;
use tokio::time;

#[derive(Serialize, Deserialize, Debug)]
struct SystemMetrics {
    timestamp: u64,
    cpu_usage_percent: f32,
    memory_used_kb: u64,
    memory_total_kb: u64,
    running_processes: usize,
}

/// Initializes the Kafka producer securely.
fn create_kafka_producer(brokers: &str) -> Result<FutureProducer> {
    let producer: FutureProducer = ClientConfig::new()
        .set("bootstrap.servers", brokers)
        .set("message.timeout.ms", "5000")
        .create()
        .context("Failed to create Kafka producer. Check broker configuration.")?;
    Ok(producer)
}

/// Gathers system metrics in a memory-safe and zero-allocation (where possible) manner.
fn gather_metrics(sys: &mut System) -> SystemMetrics {
    sys.refresh_cpu();
    sys.refresh_memory();
    sys.refresh_processes();

    let cpu_usage = sys.global_cpu_info().cpu_usage();
    let mem_used = sys.used_memory();
    let mem_total = sys.total_memory();
    let proc_count = sys.processes().len();

    SystemMetrics {
        timestamp: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs(),
        cpu_usage_percent: cpu_usage,
        memory_used_kb: mem_used,
        memory_total_kb: mem_total,
        running_processes: proc_count,
    }
}

/// The core asynchronous monitoring loop.
async fn monitor_loop(producer: FutureProducer, topic: &str) {
    let mut sys = System::new_all();
    let mut interval = time::interval(Duration::from_secs(5));

    info!("Starting Polaris rust_sys_monitor loop...");

    loop {
        interval.tick().await;

        let metrics = gather_metrics(&mut sys);
        
        match serde_json::to_string(&metrics) {
            Ok(payload) => {
                let record = FutureRecord::to(topic)
                    .payload(&payload)
                    .key("sys_metrics");

                match producer.send(record, Duration::from_secs(0)).await {
                    Ok((partition, offset)) => {
                        info!("Metrics sent: partition {} offset {}", partition, offset);
                    }
                    Err((err, _)) => {
                        error!("Failed to enqueue message to Kafka: {:?}", err);
                        // In a production system, we might buffer these locally or trigger a local alert
                    }
                }
            }
            Err(e) => {
                warn!("Serialization error, dropping metrics payload: {:?}", e);
            }
        }
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize standard logging
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();
    
    info!("POLARIS Rust System Monitor Initializing...");

    // Environment configuration
    let kafka_broker = std::env::var("KAFKA_BROKER").unwrap_or_else(|_| "localhost:9092".to_string());
    let kafka_topic = std::env::var("KAFKA_TOPIC").unwrap_or_else(|_| "system_logs".to_string());

    let producer = create_kafka_producer(&kafka_broker)?;

    // Start the non-blocking monitor loop
    monitor_loop(producer, &kafka_topic).await;

    Ok(())
}
