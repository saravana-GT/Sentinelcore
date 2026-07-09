package com.example.service;

import com.example.Config.JPAUtil;
import com.example.model.Alert;
import com.example.model.Metric;
import com.example.model.User;
import jakarta.persistence.EntityManager;
import org.mindrot.jbcrypt.BCrypt;
import java.util.List;

public class DataService {

    public void saveUser(User user) {
        EntityManager em = JPAUtil.getEntityManager();
        em.getTransaction().begin();
        // Hash user passwords safely before saving to the database
        user.setPassword(BCrypt.hashpw(user.getPassword(), BCrypt.gensalt(10)));
        em.persist(user);
        em.getTransaction().commit();
        em.close();
    }

    public User findUserByEmail(String email) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.createQuery("SELECT u FROM User u WHERE u.email = :email", User.class)
                    .setParameter("email", email)
                    .getSingleResult();
        } catch (Exception e) {
            return null;
        } finally {
            em.close();
        }
    }

    public void saveAlert(Alert alert) {
        EntityManager em = JPAUtil.getEntityManager();
        em.getTransaction().begin();
        em.persist(alert);
        em.getTransaction().commit();
        em.close();
    }

    public List<Alert> getAllAlerts() {
        EntityManager em = JPAUtil.getEntityManager();
        List<Alert> alerts = em.createQuery("SELECT a FROM Alert a ORDER BY a.createdAt DESC", Alert.class)
                .getResultList();
        em.close();
        return alerts;
    }

    public void saveMetric(Metric metric) {
        EntityManager em = JPAUtil.getEntityManager();
        em.getTransaction().begin();
        em.persist(metric);
        em.getTransaction().commit();
        em.close();
    }

    public List<Metric> getLatestMetrics() {
        EntityManager em = JPAUtil.getEntityManager();
        List<Metric> metrics = em.createQuery("SELECT m FROM Metric m ORDER BY m.createdAt DESC", Metric.class)
                .setMaxResults(50)
                .getResultList();
        em.close();
        return metrics;
    }
}
