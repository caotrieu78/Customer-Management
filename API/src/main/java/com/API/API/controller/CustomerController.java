package com.API.API.controller;

import com.API.API.dto.CustomerRequest;
import com.API.API.model.Customer;
import com.API.API.model.CustomerClassification;
import com.API.API.model.User;
import com.API.API.service.CustomerService;
import com.API.API.repository.CustomerClassificationRepository;
import com.API.API.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private CustomerClassificationRepository classificationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Integer id) {
        Optional<Customer> customer = customerService.getCustomerById(id);
        return customer.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Customer> createCustomer(@RequestBody CustomerRequest customerRequest) {
        Customer customer = new Customer();
        customer.setName(customerRequest.getName());
        customer.setEmail(customerRequest.getEmail());
        customer.setPhone(customerRequest.getPhone());
        customer.setAddress(customerRequest.getAddress());
        customer.setDateOfBirth(customerRequest.getDateOfBirth());

        if (customerRequest.getClassificationId() != null) {
            CustomerClassification classification = classificationRepository
                    .findById(customerRequest.getClassificationId())
                    .orElseThrow(() -> new RuntimeException("Classification not found"));
            customer.setClassification(classification);
        }

        if (customerRequest.getUserId() != null) {
            User user = userRepository
                    .findById(customerRequest.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            customer.setUser(user);
        }

        Customer savedCustomer = customerService.createCustomer(customer);
        return ResponseEntity.ok(savedCustomer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable Integer id, @RequestBody CustomerRequest customerRequest) {
        try {
            Customer customer = new Customer();
            customer.setName(customerRequest.getName());
            customer.setEmail(customerRequest.getEmail());
            customer.setPhone(customerRequest.getPhone());
            customer.setAddress(customerRequest.getAddress());
            customer.setDateOfBirth(customerRequest.getDateOfBirth());
            Customer updatedCustomer = customerService.updateCustomer(id, customer);
            return ResponseEntity.ok(updatedCustomer);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Integer id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }
}
