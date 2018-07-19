import os
dirname, filename = os.path.split(os.path.abspath(__file__))
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]=dirname + "/aidev-5484fef5ccf6.json"

from flask import Flask
from flask import render_template
from flask import request

from google.cloud import vision
from google.cloud.vision import types

import json
import base64
from random import shuffle

from fuzzywuzzy import process

import firebase_admin
from firebase_admin import credentials
from firebase_admin import db


app = Flask(__name__)
client = vision.ImageAnnotatorClient()

# Fetch the service account key JSON file contents
cred = credentials.Certificate('aidev-ecee9-firebase-adminsdk-xdjvq-b2df617a93.json')
# Initialize the app with a service account, granting admin privileges
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://aidev-ecee9.firebaseio.com/'
});
refSentences = db.reference('sentences');

def look(words):
	global refSentences
	#fetch data from firebase into array
	sentences = [];
	for item in refSentences.get():
		sentences.append(item);

	#parse words from request
	results = set();
	for word in words:
		for oj in process.extract(word, sentences, limit=4):
			label,confidence = oj
			if confidence >= 50:
				results.add(label)
	return list(results)

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/predict",methods=['POST'])
def predict():

	content = base64.b64decode(request.form['image'])
	image = types.Image(content=content)
	response = client.annotate_image({
		'image': image,
		'features': [{'type': vision.enums.Feature.Type.LABEL_DETECTION}]
	})

	labels = [];
	for label in response.label_annotations:
		labels.append(label.description);

	results = look(labels[0:3]);
	
	return app.response_class(
        response= json.dumps({
        		"cloud-vision" : labels,
        		"cloud-database" : results
        	}),
        status=200,
        mimetype='application/json'
    )

@app.route("/find/words",methods=['GET'])
def find():
	words = request.args.get('words').split(',')
	results = look(words)
	return app.response_class(
        response= json.dumps(results),
        status=200,
        mimetype='application/json'
    )
app.run();
#set GOOGLE_APPLICATION_CREDENTIALS="C:\Users\Musab Hussain\Desktop\label\aidev-5484fef5ccf6.json"