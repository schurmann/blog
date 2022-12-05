package dev.schurmann.spring.demo

import mu.KotlinLogging
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class HelloWorld {
    private val log = KotlinLogging.logger {}

    @GetMapping("/")
    fun hello(): String {
        log.info { "Hello world!" }
        return "Hello world!"
    }
}