# K8s Todo API — Local Kubernetes Deployment

A minimal Todo API (Node.js/Express + Redis) deployed to a local Kubernetes
cluster, demonstrating Deployments, Services, Ingress, and a Helm chart.

## Prerequisites

Install these first:

```bash
# Docker Desktop (includes docker)
# https://www.docker.com/products/docker-desktop

# minikube
brew install minikube        # macOS
# or see https://minikube.sigs.k8s.io/docs/start/ for Linux/Windows

# kubectl
brew install kubectl

# helm
brew install helm
```

## 1. Start the cluster

```bash
minikube start
minikube addons enable ingress
```

## 2. Build the app image inside minikube's Docker environment

This makes the image available to the cluster without pushing to a registry.

```bash
cd app
eval $(minikube docker-env)
docker build -t todo-api:local .
cd ..
```

## 3. Deploy with raw manifests

```bash
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/redis-service.yaml
kubectl apply -f k8s/todo-api-deployment.yaml
kubectl apply -f k8s/todo-api-service.yaml
kubectl apply -f k8s/ingress.yaml
```

Check everything is running:

```bash
kubectl get pods
kubectl get deployments
kubectl get services
kubectl get ingress
```

## 4. Access the API

```bash
# Get minikube's IP and map it to the ingress host
echo "$(minikube ip) todo.local" | sudo tee -a /etc/hosts

# Test it
curl http://todo.local/health
curl -X POST http://todo.local/todos -H "Content-Type: application/json" -d '{"text":"Learn Kubernetes"}'
curl http://todo.local/todos
```

## 5. Tear down the raw manifests (before trying Helm)

```bash
kubectl delete -f k8s/
```

## 6. Deploy the same thing with Helm instead

```bash
helm install todo-release ./helm-todo-chart

# see what it generated without installing
helm template todo-release ./helm-todo-chart

# upgrade after changing values.yaml
helm upgrade todo-release ./helm-todo-chart

# uninstall
helm uninstall todo-release
```

## 7. Cleanup

```bash
minikube stop
minikube delete
```

## What this demonstrates (for your CV / interview talking points)

- **Deployments**: replica management, resource requests/limits, readiness
  and liveness probes for the API pods.
- **Services**: internal ClusterIP service discovery (`todo-api-service` ->
  `redis-service` via DNS name, no hardcoded IPs).
- **Ingress**: routing external HTTP traffic into the cluster via an
  nginx ingress controller.
- **Helm**: templating the same manifests with `values.yaml` so
  replica counts, images, and hostnames are configurable per environment.

## Suggested CV bullet once you've run this yourself

> Deployed a containerized Node.js/Redis application on a local Kubernetes
> cluster (minikube), configuring Deployments with health probes, ClusterIP
> Services for internal discovery, and Ingress for external routing;
> templated the deployment with a custom Helm chart for environment-based
> configuration.
