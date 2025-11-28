import json

def generate_qr_data(start_id, num_records):
    data = []
    for i in range(num_records):
        qr_id = f"Q{start_id + i}@ybl"
        qr_text = f"upi://pay?mode=02&pa={qr_id}&purpose=00&mc=0000&pn=PhonePeMerchant&orgid=180&sign=MEUCIFl2+G58pGB1In6CZgLxaoBMJsKVJGm6FhCx9jw7qZLXAiEA7W1hS68Z9VwIWhq2TQBS+m7QCi1E3rNiAcpcI="
        lot_number = "220801110"
        print_format = "Test PrintFormat"
        data.append({
            "qr_id": qr_id,
            "qr_text": qr_text,
            "lot_number": lot_number,
            "print_format": print_format
        })
    return data

# Generate 700 records
start_id = 522322
num_records = 70000
qr_data = generate_qr_data(start_id, num_records)

# Save to JSON
with open('LotData.json', 'w') as f:
    json.dump({"data": qr_data}, f, indent=4)

print(f"{num_records} records generated and saved to LotData.json")
    