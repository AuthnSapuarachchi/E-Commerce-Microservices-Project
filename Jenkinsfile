pipeline {
    agent any

    tools {
        maven 'maven-3'
        jdk 'jdk-21'
    }

    environment {
        DOCKER_HUB_USER = "authnbroo" 
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-login')
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', 
                    credentialsId: 'github-login', 
                    url: 'https://github.com/AuthnSapuarachchi/E-Commerce-Microservices-Project.git'
            }
        }

        stage('Build & Dockerize Microservices') {
            parallel {
                stage('Product Service') {
                    steps {
                        script {
                            echo "📦 Building Product Service..."
                            sh 'mvn -f product-service/pom.xml clean package -DskipTests'
                            sh "docker build -t ${DOCKER_HUB_USER}/product-service:latest ./product-service"
                            withCredentials([usernamePassword(credentialsId: 'docker-hub-login', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                                sh "echo $PASS | docker login -u $USER --password-stdin"
                                sh "docker push ${DOCKER_HUB_USER}/product-service:latest"
                            }
                        }
                    }
                }
                
                stage('Order Service') {
                    steps {
                        script {
                            echo "📦 Building Order Service..."
                            sh 'mvn -f order-service/pom.xml clean package -DskipTests'
                            sh "docker build -t ${DOCKER_HUB_USER}/order-service:latest ./order-service"
                            withCredentials([usernamePassword(credentialsId: 'docker-hub-login', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                                sh "echo $PASS | docker login -u $USER --password-stdin"
                                sh "docker push ${DOCKER_HUB_USER}/order-service:latest"
                            }
                        }
                    }
                }

                stage('Inventory Service') {
                    steps {
                        script {
                            echo "📦 Building Inventory Service..."
                            sh 'mvn -f inventory-service/pom.xml clean package -DskipTests'
                            sh "docker build -t ${DOCKER_HUB_USER}/inventory-service:latest ./inventory-service"
                            withCredentials([usernamePassword(credentialsId: 'docker-hub-login', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                                sh "echo $PASS | docker login -u $USER --password-stdin"
                                sh "docker push ${DOCKER_HUB_USER}/inventory-service:latest"
                            }
                        }
                    }
                }
                
                stage('Notification Service') {
                    steps {
                        script {
                            echo "📦 Building Notification Service..."
                            // Check folder name: notification-service vs notification_service
                            sh 'mvn -f notification-service/pom.xml clean package -DskipTests'
                            sh "docker build -t ${DOCKER_HUB_USER}/notification-service:latest ./notification-service"
                            withCredentials([usernamePassword(credentialsId: 'docker-hub-login', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                                sh "echo $PASS | docker login -u $USER --password-stdin"
                                sh "docker push ${DOCKER_HUB_USER}/notification-service:latest"
                            }
                        }
                    }
                }

                stage('API Gateway') {
                    steps {
                        script {
                            echo "📦 Building API Gateway..."
                            sh 'mvn -f api-gateway/pom.xml clean package -DskipTests'
                            sh "docker build -t ${DOCKER_HUB_USER}/api-gateway:latest ./api-gateway"
                            withCredentials([usernamePassword(credentialsId: 'docker-hub-login', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                                sh "echo $PASS | docker login -u $USER --password-stdin"
                                sh "docker push ${DOCKER_HUB_USER}/api-gateway:latest"
                            }
                        }
                    }
                }

                stage('Discovery Service') {
                    steps {
                        script {
                            echo "📦 Building Discovery Service..."
                            sh 'mvn -f discovery-server/pom.xml clean package -DskipTests'
                            sh "docker build -t ${DOCKER_HUB_USER}/discovery-server:latest ./discovery-server"
                            withCredentials([usernamePassword(credentialsId: 'docker-hub-login', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                                sh "echo $PASS | docker login -u $USER --password-stdin"
                                sh "docker push ${DOCKER_HUB_USER}/discovery-server:latest"
                            }
                        }
                    }
                }
            }
        }
    }
}