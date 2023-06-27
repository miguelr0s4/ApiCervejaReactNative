import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import * as SQLite from 'expo-sqlite';
import axios from 'axios';

const db = SQLite.openDatabase('cerveja.db');

const App = () => {
  const [cerveja, setCerveja] = useState(null);
  const [cervejasSalvas, setCervejasSalvas] = useState([]);
  const [exibirCervejasSalvas, setExibirCervejasSalvas] = useState(false);

  useEffect(() => {
    criarTabela();
    carregarCervejasSalvas();
  }, []);

  const criarTabela = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS cervejas (id INTEGER PRIMARY KEY AUTOINCREMENT, marca TEXT, nome TEXT, estilo TEXT)'
      );
    });
  };

  const buscarCervejaAleatoria = async () => {
    try {
      const response = await axios.get('https://random-data-api.com/api/beer/random_beer');
      const dadosCerveja = response.data;
      setCerveja(dadosCerveja);
      salvarCerveja(dadosCerveja);
    } catch (error) {
      console.log(error);
    }
  };

  const salvarCerveja = (dadosCerveja) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO cervejas (marca, nome, estilo) VALUES (?, ?, ?)',
        [dadosCerveja.brand, dadosCerveja.name, dadosCerveja.style],
        () => {
          console.log('Cerveja salva com sucesso');
          carregarCervejasSalvas();
        },
        (error) => {
          console.log(error);
        }
      );
    });
  };

  const carregarCervejasSalvas = () => {
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM cervejas', [], (_, { rows }) => {
        setCervejasSalvas(rows._array);
      });
    });
  };

  const renderizarItemCerveja = ({ item }) => (
    <TouchableOpacity style={styles.itemCerveja} onPress={() => exibirDetalhesCerveja(item)}>
      <Text>{item.marca}</Text>
      <Text>{item.nome}</Text>
      <Text>{item.estilo}</Text>
    </TouchableOpacity>
  );

  const exibirDetalhesCerveja = (dadosCerveja) => {
    console.log(dadosCerveja);
  };

  const alternarExibicaoCervejasSalvas = () => {
    setExibirCervejasSalvas(!exibirCervejasSalvas);
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="Buscar cerveja" onPress={buscarCervejaAleatoria} color="#FFD700" />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title={exibirCervejasSalvas ? "Ocultar cervejas salvas" : "Listar cervejas salvas"}
          onPress={alternarExibicaoCervejasSalvas}
          color="#FFD700"
        />
      </View>
      {cerveja && (
        <View style={styles.detalhesCerveja}>
          <Text>Marca: {cerveja.brand}</Text>
          <Text>Nome: {cerveja.name}</Text>
          <Text>Estilo: {cerveja.style}</Text>
        </View>
      )}
      {exibirCervejasSalvas && (
        <ScrollView style={styles.scrollView}>
          <FlatList
            data={cervejasSalvas}
            renderItem={renderizarItemCerveja}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={() => <Text>Nenhum registro encontrado</Text>}
          />
        </ScrollView>
      )}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonContainer: {
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#FFD700'
  },
  itemCerveja: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5
  },
  detalhesCerveja: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,

  },
  scrollView: {
    marginTop: 20,
    maxHeight: 200,
  },
};

export default App;

