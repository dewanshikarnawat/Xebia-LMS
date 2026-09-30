package com.company.learningmanagement.security;

import com.company.learningmanagement.repository.assignment.StudentRepository;
import com.company.learningmanagement.repository.assignment.TeacherRepository;
import com.company.learningmanagement.repository.assignment.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.company.learningmanagement.enums.Role;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final AdminRepository adminRepository;

    private final Map<String, CachedUser> userCache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 60000; // 60 seconds

    private static class CachedUser {
        final UserDetails userDetails;
        final long expiry;

        CachedUser(UserDetails userDetails) {
            this.userDetails = userDetails;
            this.expiry = System.currentTimeMillis() + CACHE_TTL_MS;
        }

        boolean isExpired() {
            return System.currentTimeMillis() > expiry;
        }
    }

    public void evict(String username) {
        if (username != null) {
            userCache.remove(username);
        }
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (username == null) {
            throw new UsernameNotFoundException("Username cannot be null");
        }

        CachedUser cached = userCache.get(username);
        if (cached != null && !cached.isExpired()) {
            return cached.userDetails;
        }

        UserDetails userDetails = fetchUserFromDb(username);
        userCache.put(username, new CachedUser(userDetails));
        return userDetails;
    }

    private UserDetails fetchUserFromDb(String username) throws UsernameNotFoundException {
        // 1. Try finding admin
        var adminOpt = adminRepository.findByEmail(username);
        if (adminOpt.isPresent()) {
            var admin = adminOpt.get();
            return new CustomUserDetails(
                    admin.getEmail(),
                    admin.getPassword(),
                    admin.getFullName(),
                    admin.getRole()
            );
        }

        // 2. Try finding teacher
        var teacherOpt = teacherRepository.findByEmail(username);
        if (teacherOpt.isPresent()) {
            var teacher = teacherOpt.get();
            return new CustomUserDetails(
                    teacher.getEmail(),
                    teacher.getPassword(),
                    teacher.getFullName(),
                    teacher.getRole()
            );
        }

        // 3. Try finding student
        var studentOpt = studentRepository.findByEmail(username);
        if (studentOpt.isPresent()) {
            var student = studentOpt.get();
            return new CustomUserDetails(
                    student.getEmail(),
                    student.getPassword(),
                    student.getFullName(),
                    student.getRole()
            );
        }

        throw new UsernameNotFoundException("User not found with email: " + username);
    }
}
