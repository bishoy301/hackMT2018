/* Kate Archer
* CSCI 4350
* OLA 4 : kmeans.cpp
* December 5, 20174350/OLA4$ ls -l
* Unsupervised Learning Project
* Command Line Arguments: v 26 09:41 cancer-data.txt
*     Random seed, 2.7K Nov 26 09:40 iris-data.txt
*     number of clusters,ov 27 08:08 iris-means.txt
*     number of real-valued features in the data-set,
*     file name for training input,7 kmeans*
*     file name for testing input.02 kmeans.cpp
* Compile with Makefile or: g++ -std=c++11 -O2 -o kmeans kmeans.cpp
*/
#include <vector>
#include <algorithm>
#include <iostream>
#include <sstream>
#include <fstream>
#include <set>
#include <math.h>
#include <cstdlib>
using namespace std;

struct kmean{
	int classification, numPoints;
	vector<double> coordinates;
	vector<double> sum;
	vector<int> classes;
};

int main(int argc, char* argv[]) {

	vector<vector<double> > data;
	string line;
	double value;
	ifstream training, testing;
	set<int> classes;
	int numClasses, numFeats, numClusters, numPoints, rSeed; // rIndex; Used in previous version before fixing k-means init
	bool updating = true;
	bool classifying = false;

	// Command-line arguments
	rSeed = atoi(argv[1]);
	numClusters = atoi(argv[2]);
	numFeats = atoi(argv[3]);
	training.open(argv[4]);
	testing.open(argv[5]);

	// Prepping of vectors provided by Dr. Phillips, from sort.cpp
	getline(training,line);
	stringstream parsed(line);

	while (!parsed.eof()) {
		parsed >> value;
		data.push_back(vector<double>());
	}

	while (!training.eof()) {
		stringstream parsed(line);
		for (int i = 0; i < data.size(); i++) {
			parsed >> value;
			data[i].push_back(value);
			if(i == data.size()-1){
				classes.insert(value);
			}
		}
		getline(training,line);
	}

	numClasses = classes.size();   // The classes set is intended to check for the # of unique classifications
	numPoints = data[0].size();    // Storing this so data[0].size() does not need to be called repeatedly
	srand(rSeed);                  // Setting the random seed

	// Creating vector of k-means, with initial locations selected randomly from data set
	// To ensure unique initialization for k-means,
	// the indices vector will help make sure a unique index from the training data is chosen
	vector<int> indices(numPoints);
	for(int i = 0; i < numPoints; i++){
		indices[i] = i;
	}
	// Random shuffle of indices
	random_shuffle(indices.begin(), indices.end());

	vector<kmean> kMeans;
	for(int i = 0; i < numClusters; i++){
		kmean temp;
		temp.sum.resize(numFeats);
		temp.coordinates.resize(numFeats);
		//rIndex = rand() % numPoints;                  // Previous implementation
		for(int j = 0; j < numFeats; j++){
			// temp.coordinates[j] = data[j][rIndex];   // Previous implementation
			temp.coordinates[j] = data[j][indices.back()];
		}
		kMeans.push_back(temp);
		indices.pop_back();
	}

	// TRAINING --------------------------------------------------------
	while(updating || classifying){
		// Initialize each kmean sum vector to 0s, and numPoints to 0.
		// (For updating)
		for(int i = 0; i < numClusters; i++){
			for(int j = 0; j < numFeats; j++){
				kMeans[i].sum[j] = 0;
			}
			kMeans[i].numPoints = 0;
		}

		double minDistance = 1000000;
		double distance, sum = 0;
		int closestkMean;
		// For each Data Point...
		for(int i = 0; i < numPoints; i++){
			// For each kMean/Cluster...
			for(int j = 0 ; j < numClusters; j++){
				// For each feature...
				for(int k = 0; k < numFeats; k++){
					sum += pow((kMeans[j].coordinates[k]-data[k][i]),2);
				}
				distance = sqrt(sum);
				if(distance < minDistance){
					closestkMean = j;
					minDistance = distance;
				}
				sum = 0;
			}
			// Now, the closest k-mean for the current data point i has been determined.
			// This point will be added to the sum vector of the closest kmean.
			// A point counter is also incremented for updating the kmean later.
			for(int l = 0; l < numFeats; l++){
				kMeans[closestkMean].sum[l] += data[l][i];
			}
			kMeans[closestkMean].numPoints++;

			if(classifying){
				// This is for the purpose of re-using the updating code to
				//compile the classes of each kmean after they have
				// settled into the appropraite location
				kMeans[closestkMean].classes.push_back(data[numFeats][i]);
			}
			minDistance = 1000000;
		}

		updating = false;
		// Update kMeans
		for(int i = 0; i < numClusters; i++){
			for(int j = 0; j < numFeats; j++){
				// DEBUG --- This should never print!
				if(kMeans[i].numPoints == 0){
					cout << "Num Points = 0" << endl;
				}
				// EODB ----
				else{
					double newPoint = kMeans[i].sum[j]/kMeans[i].numPoints;
					if(kMeans[i].coordinates[j] != newPoint){
						kMeans[i].coordinates[j] = newPoint;
						updating = true;
					}
				}
			}
		}

		if(!updating && classifying){
			classifying = false;
		}
		else if(!updating){
			classifying = true;
		}
	}

	// For each kmean, find majority class in the cluster to determine classification
	set<int>::iterator classesIt;
	int counter, maxClass;
	// For each kMean/Cluster...
	for(int i = 0; i < numClusters; i++){
		counter = 0;
		// For each class in the set...
		for(classesIt = classes.begin(); classesIt != classes.end(); classesIt++){
			// Count number of *classesIt in kmean[i].classes
			int temp = count(kMeans[i].classes.begin(), kMeans[i].classes.end(), *classesIt);
			if(temp > counter){
				counter = temp;
				maxClass = *classesIt;
			}
		}
		kMeans[i].classification = maxClass;
	}

	// TESTING ----------------------------------------------------------
	double testData[numFeats];
	int testClass, correctTests = 0;

	// Read Initial Data Point
	for(int i = 0; i < numFeats; i ++){
		testing >> testData[i];
	}
	testing >> testClass;

	while(!testing.eof()){
		// Find closest kMean
		double minDistance = 1000000;
		double distance, sum = 0;
		int closestkMean;
		for(int i = 0; i < numClusters; i++){
			for(int j = 0; j < numFeats; j++){
				sum += pow(kMeans[i].coordinates[j]-testData[j],2);
			}
			distance = sqrt(sum);
			if(distance < minDistance){
				closestkMean = i;
				minDistance = distance;
			}
			sum = 0;
		}
		// Check classification
		if(kMeans[closestkMean].classification == testClass){
			correctTests++;
		}

		// Read Next Data Point
		for(int i = 0; i < numFeats; i ++){
			testing >> testData[i];
		}
		testing >> testClass;
	}
	// Output the number of correct classifications
	cout << correctTests << endl;

	return 0;
}
