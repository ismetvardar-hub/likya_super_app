import 'dart:async';

class MeshNodeModel {
  final String peerId;
  final String peerName;
  final int signalRssi; // dBm
  final int hopsCount;
  final bool isDirectNeighbor;

  MeshNodeModel({
    required this.peerId,
    required this.peerName,
    required this.signalRssi,
    required this.hopsCount,
    required this.isDirectNeighbor,
  });
}

class MeshNetworkService {
  static final MeshNetworkService _instance = MeshNetworkService._internal();
  factory MeshNetworkService() => _instance;
  MeshNetworkService._internal();

  final List<MeshNodeModel> _discoveredNodes = [
    MeshNodeModel(peerId: 'NODE-LKY-01', peerName: 'Zeynep (Dağ Rehberi)', signalRssi: -42, hopsCount: 1, isDirectNeighbor: true),
    MeshNodeModel(peerId: 'NODE-LKY-02', peerName: 'Kemal Usta (Maker Lab)', signalRssi: -65, hopsCount: 1, isDirectNeighbor: true),
    MeshNodeModel(peerId: 'NODE-LKY-03', peerName: 'Phaselis Röle İstasyonu', signalRssi: -78, hopsCount: 2, isDirectNeighbor: false),
    MeshNodeModel(peerId: 'NODE-LKY-04', peerName: 'Amfi Sahne Ses Masası', signalRssi: -52, hopsCount: 1, isDirectNeighbor: true),
  ];

  List<MeshNodeModel> get discoveredNodes => List.unmodifiable(_discoveredNodes);

  Future<bool> broadcastMeshMessage(String text) async {
    // Simüle edilmiş Bluetooth Low Energy (BLE) çok atlamalı (multi-hop) yayın
    await Future.delayed(const Duration(milliseconds: 300));
    return true;
  }
}
