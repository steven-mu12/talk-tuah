import asyncio
import time
from hume import AsyncHumeClient
from hume.expression_measurement.batch import Face, Models
from hume.expression_measurement.batch.types import InferenceBaseRequest

async def main():
    # Initialize an authenticated client
    client = AsyncHumeClient(api_key="LG8iNkWjfL8CByQ2NzZVGWDWjdQOyidlWfzO8PO0MGHbe8de")

    # Define the filepath(s) of the file(s) you would like to analyze
    local_filepaths = [
        open("../output/image.jpg", mode="rb")
    ]

    # Create configurations for each model you would like to use (blank = default)
    face_config = Face()

    # Create a Models object
    models_chosen = Models(face=face_config)
    
    # Create a stringified object containing the configuration
    stringified_configs = InferenceBaseRequest(models=models_chosen)

    # Start an inference job and print the job_id
    job_id = await client.expression_measurement.batch.start_inference_job_from_local_file(
        json=stringified_configs, file=local_filepaths
    )
    print(job_id)

    time.sleep(1)

    while True:
        status = await client.expression_measurement.batch.get_job_details(job_id)
        print(f"Job status: {status.state}")

        if status.state.status == "COMPLETED":
            print("Job completed, fetching results.")
            break
        elif status.state.status == "FAILED":
            print("Job failed.")
            return
        

    # Fetch the job result after completion
    job_predictions = await client.expression_measurement.batch.get_job_predictions(job_id)

    # Process and print out the detected expressions
    for face_result in job_predictions:
        print(face_result.json)

if __name__ == "__main__":
    asyncio.run(main())
    