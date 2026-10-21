package com.chrisgonzalez.videogametracker.persistence;

import com.chrisgonzalez.videogametracker.domain.Console;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class ConsoleRepository {

    private final JdbcTemplate jdbcTemplate;

    public ConsoleRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    public List<Console> findAll() {
        return jdbcTemplate.query(
                "SELECT name FROM consoles ORDER BY name",
                (resultSet, rowNumber) -> new Console(resultSet.getString("name")));
    }
}
