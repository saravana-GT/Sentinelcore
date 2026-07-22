package com.example.service;

import com.example.Config.JPAUtil;
import com.example.model.Alert;
import com.example.model.KnowledgeBase;
import com.example.model.Metric;
import com.example.model.User;
import jakarta.persistence.EntityManager;
import org.mindrot.jbcrypt.BCrypt;

import java.util.List;


public class DataService {

    // ========================= USER =========================

    public void saveUser(User user) {
        EntityManager em = JPAUtil.getEntityManager();
        em.getTransaction().begin();

        user.setPassword(BCrypt.hashpw(user.getPassword(), BCrypt.gensalt(10)));

        em.persist(user);

        em.getTransaction().commit();
        em.close();
    }

    public User findUserByEmail(String email) {
        EntityManager em = JPAUtil.getEntityManager();

        try {
            return em.createQuery(
                    "SELECT u FROM User u WHERE u.email = :email",
                    User.class)
                    .setParameter("email", email)
                    .getSingleResult();

        } catch (Exception e) {
            return null;
        } finally {
            em.close();
        }
    }
    //All Users

    public List<User> getAllUsers() {

    EntityManager em = JPAUtil.getEntityManager();

    List<User> users = em.createQuery(
            "SELECT u FROM User u",
            User.class)
            .getResultList();

    em.close();

    return users;
}

    // ========================= ALERT =========================

    public void saveAlert(Alert alert) {
        EntityManager em = JPAUtil.getEntityManager();

        em.getTransaction().begin();
        em.persist(alert);
        em.getTransaction().commit();

        em.close();
    }

    public List<Alert> getAllAlerts() {
        EntityManager em = JPAUtil.getEntityManager();

        List<Alert> alerts = em.createQuery(
                "SELECT a FROM Alert a ORDER BY a.createdAt DESC",
                Alert.class)
                .getResultList();

        em.close();

        return alerts;
    }

    // ========================= METRIC =========================

    public void saveMetric(Metric metric) {
        EntityManager em = JPAUtil.getEntityManager();

        em.getTransaction().begin();
        em.persist(metric);
        em.getTransaction().commit();

        em.close();
    }

    public List<Metric> getLatestMetrics() {
        EntityManager em = JPAUtil.getEntityManager();

        List<Metric> metrics = em.createQuery(
                "SELECT m FROM Metric m ORDER BY m.createdAt DESC",
                Metric.class)
                .setMaxResults(50)
                .getResultList();

        em.close();

        return metrics;
    }

    // ========================= KNOWLEDGE BASE =========================

    public void saveKnowledgeBase(KnowledgeBase article) {
        EntityManager em = JPAUtil.getEntityManager();

        em.getTransaction().begin();
        em.persist(article);
        em.getTransaction().commit();

        em.close();
    }

    public List<KnowledgeBase> getAllKnowledgeBase() {
        EntityManager em = JPAUtil.getEntityManager();

        List<KnowledgeBase> articles = em.createQuery(
                "SELECT k FROM KnowledgeBase k ORDER BY k.createdAt DESC",
                KnowledgeBase.class)
                .getResultList();

        em.close();

        return articles;
    }

    public KnowledgeBase findKnowledgeBaseById(Long id) {
        EntityManager em = JPAUtil.getEntityManager();

        KnowledgeBase article = em.find(KnowledgeBase.class, id);

        em.close();

        return article;
    }

    public void deleteKnowledgeBase(Long id) {
        EntityManager em = JPAUtil.getEntityManager();

        em.getTransaction().begin();

        KnowledgeBase article = em.find(KnowledgeBase.class, id);

        if (article != null) {
            em.remove(article);
        }

        em.getTransaction().commit();

        em.close();
    }
    public void deleteKnowledgeArticle(Long id) {
    EntityManager em = JPAUtil.getEntityManager();

    try {
        em.getTransaction().begin();

        KnowledgeBase article = em.find(KnowledgeBase.class, id);

        if (article != null) {
            em.remove(article);
        }

        em.getTransaction().commit();
    } finally {
        em.close();
    }
    
}
public void updateKnowledgeArticle(KnowledgeBase updatedArticle) {
    EntityManager em = JPAUtil.getEntityManager();

    try {
        em.getTransaction().begin();

        KnowledgeBase article = em.find(KnowledgeBase.class, updatedArticle.getId());

        if (article != null) {
            article.setTitle(updatedArticle.getTitle());
            article.setCategory(updatedArticle.getCategory());
            article.setContent(updatedArticle.getContent());
            article.setAuthor(updatedArticle.getAuthor());

            em.merge(article);
        }

        em.getTransaction().commit();
    } finally {
        em.close();
    }
}
}
