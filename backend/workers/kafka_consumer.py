import json
import logging
from confluent_kafka import Consumer, KafkaError, KafkaException
import sys
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("polaris-kafka-consumer")

# Configuration via environment variables with defaults
KAFKA_BROKER = os.environ.get("KAFKA_BROKER", "localhost:9092")
TOPICS = ["network_logs", "system_logs"]
GROUP_ID = "polaris_analytics_group"

def process_message(msg):
    """
    Process the incoming Kafka message from edge agents.
    """
    try:
        data = json.loads(msg.value().decode('utf-8'))
        topic = msg.topic()
        
        # Placeholder for routing to AI engine or DB
        logger.info(f"Received from [Topic: {topic}]: {data}")
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to decode message: {e}")
    except Exception as e:
        logger.error(f"Error processing message: {e}")

def main():
    conf = {
        'bootstrap.servers': KAFKA_BROKER,
        'group.id': GROUP_ID,
        'auto.offset.reset': 'earliest',
        # 'security.protocol': 'SASL_SSL' # for production
    }

    consumer = Consumer(conf)

    try:
        consumer.subscribe(TOPICS)
        logger.info(f"Subscribed to topics: {TOPICS} on broker {KAFKA_BROKER}")

        while True:
            msg = consumer.poll(timeout=1.0)
            
            if msg is None:
                continue
                
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    # End of partition event
                    logger.debug(f"{msg.topic()} [{msg.partition()}] reached end at offset {msg.offset()}")
                elif msg.error():
                    raise KafkaException(msg.error())
            else:
                process_message(msg)
                
    except KeyboardInterrupt:
        logger.info("Interrupted by user, shutting down consumer.")
    except Exception as e:
        logger.critical(f"Unexpected error in consumer loop: {e}")
        sys.exit(1)
    finally:
        # Close down consumer to commit final offsets.
        consumer.close()
        logger.info("Kafka consumer cleanly shut down.")

if __name__ == '__main__':
    main()
